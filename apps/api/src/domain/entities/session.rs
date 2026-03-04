use std::net::IpAddr;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A serialisable view of a single active session — returned by the devices
/// endpoint. Contains only what the client needs; never exposes `token_id`
/// or raw session internals.
#[derive(Debug, Serialize)]
pub struct SessionSummary {
    pub session_id:     String,
    pub device_name:    Option<String>,
    pub ip_address:     Option<IpAddr>,
    pub login_at:       i64,
    pub last_active_at: i64,
    /// Whether this summary represents the caller's own current session.
    pub is_current:     bool,
}

/// Hard maximum session lifetime regardless of activity — 30 days.
pub const HARD_MAX_SECS: i64 = 60 * 60 * 24 * 30;

/// Sliding inactivity window — tower-sessions resets the Redis TTL to this
/// value on every response.
pub const SLIDING_TTL_SECS: i64 = 60 * 60 * 24; // 24 hours

/// The key used to store `UserSession` inside the tower-sessions envelope.
pub const SESSION_KEY: &str = "user";

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserSession {
    /// Identity
    pub user_id: Uuid,

    /// Authorisation
    pub permissions: Vec<String>,

    /// Compared against the user row in Postgres on every authenticated
    /// request. Incrementing this column instantly invalidates all sessions
    /// for that user — use on password change, role change, or account ban.
    pub session_version: i32,

    /// # Revocation
    /// Unique ID for this specific session token. Allows surgical
    /// single-session invalidation independently of `session_version`.
    pub token_id: Uuid,

    /// # Lifetime
    /// Unix timestamp (seconds) of initial login. Enforces the hard max TTL —
    /// Redis's native TTL alone only tracks the sliding inactivity window.
    pub login_at: i64,

    /// Unix timestamp (seconds) updated on every authenticated request.
    /// Powers "last seen" on the devices page.
    pub last_active_at: i64,

    /// # Device fingerprinting
    /// IP address at login time. A sudden geographic change can trigger a
    /// re-authentication challenge.
    pub ip_address: Option<IpAddr>,

    /// Raw user agent string — stored for anomaly detection.
    pub user_agent: Option<String>,

    /// Human-readable label parsed from `user_agent` at login.
    /// Shown on the devices page — e.g. "Chrome on macOS", "iPhone".
    pub device_name: Option<String>,
}

impl UserSession {
    pub fn new(
        user_id: Uuid,
        permissions: Vec<String>,
        session_version: i32,
        ip_address: Option<IpAddr>,
        user_agent: Option<String>,
    ) -> Self {
        let now = now_secs();
        Self {
            user_id,
            permissions,
            session_version,
            token_id: Uuid::new_v4(),
            login_at: now,
            last_active_at: now,
            device_name: user_agent.as_deref().map(parse_device_name),
            ip_address,
            user_agent,
        }
    }

    /// Returns `true` if the session has exceeded the hard maximum lifetime.
    pub fn is_hard_expired(&self) -> bool { now_secs() - self.login_at > HARD_MAX_SECS }

    /// Refreshes `last_active_at` to now. Call on every authenticated request
    /// before re-saving the session.
    pub fn touch(&mut self) { self.last_active_at = now_secs(); }
}

/// Current Unix timestamp in whole seconds.
fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

/// Parses a minimal human-readable device label from a raw user agent string.
///
/// Intentionally simple — swap in `woothee` or `uaparser` for
/// production-grade parsing if you need accuracy over a wide UA range.
fn parse_device_name(ua: &str) -> String {
    let lower = ua.to_lowercase();

    let os = if lower.contains("iphone") {
        "iPhone"
    } else if lower.contains("ipad") {
        "iPad"
    } else if lower.contains("android") {
        "Android"
    } else if lower.contains("mac os") {
        "macOS"
    } else if lower.contains("windows") {
        "Windows"
    } else if lower.contains("linux") {
        "Linux"
    } else {
        "Unknown OS"
    };

    let browser = if lower.contains("edg/") {
        "Edge"
    } else if lower.contains("chrome") {
        "Chrome"
    } else if lower.contains("firefox") {
        "Firefox"
    } else if lower.contains("safari") {
        "Safari"
    } else {
        "Unknown Browser"
    };

    // Mobile devices are identified by hardware alone — browser is noise.
    if matches!(os, "iPhone" | "iPad" | "Android") {
        os.to_string()
    } else {
        format!("{browser} on {os}")
    }
}
