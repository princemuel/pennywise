use ::std::process;
use ::std::sync::Arc;
use ::std::sync::atomic::{AtomicBool, Ordering};

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

    // Set up graceful shutdown flag
    let shutdown_flag = Arc::new(AtomicBool::new(false));
    let shutdown_flag_clone = Arc::clone(&shutdown_flag);

    // Set up Ctrl+C handler
    tokio::spawn(async move {
        match tokio::signal::ctrl_c().await {
            Ok(()) => {
                info!("Received Ctrl+C, initiating shutdown...");
                shutdown_flag_clone.store(true, Ordering::Relaxed);
            },
            Err(err) => {
                error!("Failed to listen for Ctrl+C: {}", err);
            },
        }
    });

    // Run the application
    if let Err(e) = run(args, shutdown_flag).await {
        error!("Application error: {}", e);
        process::exit(1);
    }

    info!("Application shutdown complete");
}

async fn run(args: Args, shutdown_flag: Arc<AtomicBool>) -> Result<()> {
    let mut syncer = ScriptSyncer::new();

    if args.interactive {
        // Interactive mode with shutdown handling
        info!("Starting interactive mode");
        tokio::select! {
            result = InteractiveMode::run(&mut syncer) => result?,
            _ = wait_for_shutdown(shutdown_flag) => {
                info!("Shutdown requested, exiting interactive mode");
                syncer.shutdown();
            }
        }
    } else if let Some(ref script_path) = args.script {
        // Single script mode
        let script_name =
            args.get_script_name().unwrap_or_else(|| "unnamed_script".to_string());

        let interpreter =
            args.interpreter.or_else(|| detect_interpreter(script_path));

        if interpreter.is_none() {
            info!(
                "No interpreter specified and couldn't auto-detect for '{}'",
                script_path.display()
            );
            info!("The script will be executed directly");
        }

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
            info!("Running script once...");
            syncer.run_cycle().await;
            info!("Script execution completed");
        } else {
            info!("Starting continuous sync mode (Press Ctrl+C to stop)");
            tokio::select! {
                _ = syncer.start() => {
                    info!("Syncer stopped");
                }
                _ = wait_for_shutdown(shutdown_flag) => {
                    info!("Shutdown requested");
                    syncer.shutdown();
                }
            }
        }
    } else {
        eprintln!(
            "Error: Must provide either a script file or use --interactive mode"
        );
        eprintln!();
        eprintln!("Examples:");
        eprintln!("  synk script.py --interval 60");
        eprintln!("  synk backup.sh --interval 3600 --interpreter bash");
        eprintln!("  synk --interactive");
        eprintln!("  synk script.py --once");
        process::exit(1);
    }

    Ok(())
}

async fn wait_for_shutdown(shutdown_flag: Arc<AtomicBool>) {
    while !shutdown_flag.load(Ordering::Relaxed) {
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }
}
