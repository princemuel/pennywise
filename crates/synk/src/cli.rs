use ::std::path::PathBuf;

use ::clap::Parser;

#[derive(Parser, Clone)]
#[command(name = "synk")]
#[command(version = "0.1.0")]
#[command(about = "Periodically runs and syncs scripts")]
#[command(long_about = None)]
pub struct Args {
    /// Script file to run
    pub script: Option<PathBuf>,

    /// Interval between runs in seconds
    #[arg(short, long, default_value = "60")]
    pub interval: u64,

    /// Interpreter to use (auto-detected if not specified)
    #[arg(short = 'e', long)]
    pub interpreter: Option<String>,

    /// Name for the script (defaults to filename)
    #[arg(short, long)]
    pub name: Option<String>,

    /// Run in interactive mode
    #[arg(long)]
    pub interactive: bool,

    /// Enable verbose logging
    #[arg(short, long)]
    pub verbose: bool,

    /// Run script once and exit (don't loop)
    #[arg(long)]
    pub once: bool,
}

impl Args {
    pub fn parse_args() -> Self {
        Self::parse()
    }

    pub fn validate(&self) -> Result<(), String> {
        if let Some(ref script) = self.script {
            if !script.exists() {
                return Err(format!(
                    "Script file '{}' does not exist",
                    script.display()
                ));
            }
        }

        if self.interval == 0 {
            return Err("Interval must be greater than 0".to_string());
        }

        if self.interactive && self.script.is_some() {
            return Err(
                "Cannot specify both script and interactive mode".to_string()
            );
        }

        Ok(())
    }

    pub fn get_script_name(&self) -> Option<String> {
        if let Some(ref name) = self.name {
            Some(name.clone())
        } else {
            self.script.as_ref().map(|script| {
                script
                    .file_name()
                    .unwrap_or_else(|| script.as_os_str())
                    .to_string_lossy()
                    .to_string()
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_script_name() {
        let mut args = Args {
            script: Some(PathBuf::from("test.py")),
            interval: 60,
            interpreter: None,
            name: None,
            interactive: false,
            verbose: false,
            once: false,
        };

        // Test default name from filename
        assert_eq!(args.get_script_name(), Some("test.py".to_string()));

        // Test custom name
        args.name = Some("custom_name".to_string());
        assert_eq!(args.get_script_name(), Some("custom_name".to_string()));

        // Test no script
        args.script = None;
        args.name = None;
        assert_eq!(args.get_script_name(), None);
    }

    #[test]
    fn test_validate() {
        let args = Args {
            script: None,
            interval: 60,
            interpreter: None,
            name: None,
            interactive: true,
            verbose: false,
            once: false,
        };

        // Interactive mode should be valid
        assert!(args.validate().is_ok());

        // Zero interval should be invalid
        let mut invalid_args = args.clone();
        invalid_args.interval = 0;
        assert!(invalid_args.validate().is_err());

        // Interactive + script should be invalid
        let mut invalid_args = args.clone();
        invalid_args.script = Some(PathBuf::from("test.py"));
        assert!(invalid_args.validate().is_err());
    }
}
