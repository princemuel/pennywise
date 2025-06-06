use ::std::collections::HashMap;
use ::std::time::Duration;
use ::tokio::time::sleep;

use ::tracing::{debug, error, info};

use crate::config::ScriptConfig;
pub struct ScriptSyncer {
    scripts: HashMap<String, ScriptConfig>,
}

impl ScriptSyncer {
    pub fn new() -> Self {
        Self { scripts: HashMap::new() }
    }

    pub fn add_script(&mut self, name: String, config: ScriptConfig) {
        info!(
            "Adding script '{}' with interval {}s",
            name, config.interval_seconds
        );
        self.scripts.insert(name, config);
    }

    pub fn remove_script(&mut self, name: &str) -> bool {
        self.scripts.remove(name).is_some()
    }

    pub fn get_script(&self, name: &str) -> Option<&ScriptConfig> {
        self.scripts.get(name)
    }

    pub fn get_script_mut(&mut self, name: &str) -> Option<&mut ScriptConfig> {
        self.scripts.get_mut(name)
    }

    pub fn list_scripts(&self) -> Vec<(&String, &ScriptConfig)> {
        self.scripts.iter().collect()
    }

    pub fn enable_script(&mut self, name: &str, enabled: bool) -> bool {
        if let Some(script) = self.scripts.get_mut(name) {
            if enabled {
                script.enable();
            } else {
                script.disable();
            }
            true
        } else {
            false
        }
    }

    pub fn script_count(&self) -> usize {
        self.scripts.len()
    }

    pub fn enabled_script_count(&self) -> usize {
        self.scripts.values().filter(|s| s.is_enabled()).count()
    }

    pub async fn run_cycle(&mut self) {
        for (name, script) in self.scripts.iter_mut() {
            if script.should_run() {
                debug!("Running script: {}", name);
                if let Err(e) = script.execute().await {
                    error!("Error executing script '{}': {}", name, e);
                }
            }
        }
    }

    pub async fn start(&mut self) {
        info!("Starting script syncer with {} scripts", self.scripts.len());

        loop {
            self.run_cycle().await;
            sleep(Duration::from_secs(1)).await;
        }
    }
}

impl Default for ScriptSyncer {
    fn default() -> Self {
        Self::new()
    }
}
