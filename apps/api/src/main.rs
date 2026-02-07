use core::net::{Ipv4Addr, SocketAddr};
use std::io;

use api::config::get_config;
use api::telemetry::{subscribe, subscriber};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let listener = subscriber("pennywise".into(), "info".into(), io::stdout);
    subscribe(listener);

    let settings = get_config()?;

    let address = SocketAddr::from((Ipv4Addr::UNSPECIFIED, settings.application.port));
    // let listener = tokio::net::TcpListener::bind(address).await?;

    println!("ADDRESS: {:?}", &address);

    Ok(())
}
