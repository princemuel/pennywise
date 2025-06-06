use ::std::process;

use ::anyhow::Result;
use ::tracing::{Level, error, info};
use ::tracing_subscriber;

use synk::{Args, InteractiveMode, ScriptConfig, ScriptSyncer, detect_interpreter};

#[tokio::main]
async fn main() {
    let args = Args::parse_args();

    // Initialize logging
    let log_level = if args.verbose { Level::DEBUG } else { Level::INFO };
    tracing_subscriber::fmt().with_max_level(log_level).with_target(false).init();

    // Validate arguments
    if let Err(e) = args.validate() {
        eprintln!("Error: {}", e);
        process::exit(1);
    }

    // Run the appropriate mode
    if let Err(e) = run(args).await {
        error!("Application error: {}", e);
        process::exit(1);
    }
}

async fn run(args: Args) -> Result<()> {
    let mut syncer = ScriptSyncer::new();

    if args.interactive {
        // Interactive mode
        info!("Starting interactive mode");
        InteractiveMode::run(&mut syncer).await?;
    } else if let Some(ref script_path) = args.script {
        // Single script mode
        let script_name =
            args.get_script_name().unwrap_or_else(|| "unnamed_script".to_string());

        // Auto-detect interpreter if not provided
        let interpreter =
            args.interpreter.or_else(|| detect_interpreter(script_path));

        if interpreter.is_none() {
            info!(
                "No interpreter specified and couldn't auto-detect for '{}'",
                script_path.display()
            );
            info!(
                "The script will be executed directly (make sure it's executable)"
            );
        }

        // Create and add script config
        let config = ScriptConfig::new(
            script_path.clone(),
            interpreter.clone(),
            args.interval,
        );

        syncer.add_script(script_name.clone(), config);

        info!("Script '{}' configured:", script_name);
        info!("  Path: {}", script_path.display());
        info!("  Interval: {}s", args.interval);
        info!(
            "  Interpreter: {}",
            interpreter.unwrap_or_else(|| "direct execution".to_string())
        );

        if args.once {
            // Run once and exit
            info!("Running script once...");
            syncer.run_cycle().await;
            info!("Script execution completed");
        } else {
            // Start continuous syncing
            info!("Starting continuous sync mode (Press Ctrl+C to stop)");
            syncer.start().await;
        }
    } else {
        // No script provided and not interactive mode
        eprintln!(
            "Error: Must provide either a script file or use --interactive mode"
        );
        eprintln!();
        eprintln!("Examples:");
        eprintln!("  synk script.py --interval 60");
        eprintln!("  synk backup.sh --interval 3600 --interpreter bash");
        eprintln!("  synk --interactive");
        eprintln!("  synk script.py --once  # Run once and exit");
        process::exit(1);
    }

    Ok(())
}
