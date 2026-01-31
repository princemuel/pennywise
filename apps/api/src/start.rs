use core::net::{IpAddr, Ipv4Addr, SocketAddr};
use tokio::net::ToSocketAddrs;

pub fn run() -> ! {
    // let service = Router::new().route("/", get(|| async { "Hello, World!" }));
    // let listener = TcpListener::bind(address).await?;
    todo!()
}

#[must_use]
pub fn address() -> impl ToSocketAddrs {
    let ip = IpAddr::V4(Ipv4Addr::UNSPECIFIED);
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);
    SocketAddr::new(ip, port)
}
