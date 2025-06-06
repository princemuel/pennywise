use ::std::path::PathBuf;
use ::std::process::Command;
use ::std::time::{Duration, SystemTime};

use ::anyhow::{Context, Result};
use ::tracing::{debug, error, info};

#[derive(Debug, Clone)]
pub struct ScriptConfig {
    pub path: PathBuf,
    pub interpreter: Option<String>,
    pub interval_seconds: u64,
    pub last_run: Option<SystemTime>,
    pub enabled: bool,
}

impl ScriptConfig {
    pub fn new(
        path: PathBuf,
        interpreter: Option<String>,
        interval_seconds: u64,
    ) -> Self {
        Self { path, interpreter, interval_seconds, last_run: None, enabled: true }
    }

    pub fn should_run(&self) -> bool {
        if !self.enabled {
            return false;
        }

        match self.last_run {
            None => true,
            Some(last) => {
                let elapsed = SystemTime::now()
                    .duration_since(last)
                    .unwrap_or(Duration::from_secs(0));
                elapsed >= Duration::from_secs(self.interval_seconds)
            },
        }
    }

    pub async fn execute(&mut self) -> Result<()> {
        info!("Executing script: {}", self.path.display());

        let mut cmd = if let Some(ref interpreter) = self.interpreter {
            let mut c = Command::new(interpreter);
            c.arg(&self.path);
            c
        } else {
            Command::new(&self.path)
        };

        let output = cmd.output().with_context(|| {
            format!("Failed to execute script: {}", self.path.display())
        })?;

        if output.status.success() {
            info!("Script executed successfully: {}", self.path.display());

            if !output.stdout.is_empty() {
                debug!("stdout: {}", String::from_utf8_lossy(&output.stdout));
            }
        } else {
            error!("Script failed: {}", self.path.display());

            if !output.stderr.is_empty() {
                error!("stderr: {}", String::from_utf8_lossy(&output.stderr));
            }
        }

        self.last_run = Some(SystemTime::now());
        Ok(())
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }
}
