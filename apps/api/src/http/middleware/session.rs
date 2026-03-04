// use tower_sessions::Session;
// use tower_sessions_redis_store::fred::prelude::*;
// use uuid::Uuid;

// use crate::domain::entities::session::{
//     HARD_MAX_SECS,
//     SESSION_KEY,
//     SLIDING_TTL_SECS,
//     SessionSummary,
//     UserSession,
// };

// // ── Write
// ─────────────────────────────────────────────────────────────────────

// pub async fn insert(session: &Session, redis: &Pool, data: UserSession) ->
// anyhow::Result<()> {     let user_id = data.user_id;
//     session.insert(SESSION_KEY, &data).await?;

//     // Register under the user's session index so we can enumerate/revoke
// later.     let session_id = session.id().to_string();
//     let user_key = user_sessions_key(user_id);
//     redis.sadd::<(), _, _>(&user_key, &session_id).await?;

//     // Give the set the same hard-max TTL so it self-cleans if the user never
//     // logs in again.
//     redis.expire::<(), _>(&user_key, HARD_MAX_SECS).await?;

//     Ok(())
// }

// // ── Read
// ──────────────────────────────────────────────────────────────────────

// pub async fn get(
//     session: &Session,
//     current_version: i32,
// ) -> anyhow::Result<Option<UserSession>> {
//     let Some(mut data) = session.get::<UserSession>(SESSION_KEY).await? else
// {         return Ok(None);
//     };

//     if data.is_hard_expired() || data.session_version != current_version {
//         session.flush().await?;
//         return Ok(None);
//     }

//     data.touch();
//     session.insert(SESSION_KEY, &data).await?;

//     Ok(Some(data))
// }

// // ── Revocation
// // ────────────────────────────────────────────────────────────────

// pub async fn revoke_current(session: &Session, redis: &RedisPool) ->
// anyhow::Result<()> {     if let Ok(Some(data)) =
// session.get::<UserSession>(SESSION_KEY).await {         let session_id =
// session.id().to_string();         redis
//             .srem::<(), _, _>(user_sessions_key(data.user_id), &session_id)
//             .await?;
//     }
//     session.flush().await?;
//     Ok(())
// }

// pub async fn revoke_by_id(
//     redis: &RedisPool,
//     user_id: Uuid,
//     session_id: &str,
// ) -> anyhow::Result<()> {
//     let user_key = user_sessions_key(user_id);
//     let is_member: bool = redis.sismember(&user_key, session_id).await?;

//     if is_member {
//         redis
//             .del::<(), _>(format!("tower_sessions:{session_id}"))
//             .await?;
//         redis.srem::<(), _, _>(&user_key, session_id).await?;
//     }

//     Ok(())
// }

// pub async fn revoke_all(redis: &RedisPool, user_id: Uuid) ->
// anyhow::Result<()> {     let user_key = user_sessions_key(user_id);
//     let session_ids: Vec<String> = redis.smembers(&user_key).await?;

//     for id in &session_ids {
//         redis.del::<(), _>(format!("tower_sessions:{id}")).await?;
//     }

//     redis.del::<(), _>(&user_key).await?;
//     Ok(())
// }

// // ── Listing
// // ───────────────────────────────────────────────────────────────────

// pub async fn list_sessions(
//     redis: &RedisPool,
//     user_id: Uuid,
//     current_session_id: &str,
// ) -> anyhow::Result<Vec<SessionSummary>> {
//     let user_key = user_sessions_key(user_id);
//     let session_ids: Vec<String> = redis.smembers(&user_key).await?;

//     let mut summaries = Vec::with_capacity(session_ids.len());
//     let mut stale_ids: Vec<String> = Vec::new();

//     for id in session_ids {
//         let raw: Option<String> =
// redis.get(format!("tower_sessions:{id}")).await?;

//         match raw.and_then(|s|
// serde_json::from_str::<serde_json::Value>(&s).ok()) {             Some(value)
// => {                 let data =
//
// serde_json::from_value::<UserSession>(value["data"][SESSION_KEY].clone())
//                         .ok();

//                 if let Some(data) = data {
//                     summaries.push(SessionSummary {
//                         is_current:     id == current_session_id,
//                         session_id:     id,
//                         device_name:    data.device_name,
//                         ip_address:     data.ip_address,
//                         login_at:       data.login_at,
//                         last_active_at: data.last_active_at,
//                     });
//                 }
//             }
//             None => stale_ids.push(id),
//         }
//     }

//     if !stale_ids.is_empty() {
//         redis
//             .srem::<(), _, _>(&user_key, stale_ids.as_slice())
//             .await?;
//     }

//     summaries.sort_by(|a, b| b.last_active_at.cmp(&a.last_active_at));

//     Ok(summaries)
// }

// // ── Session layer builder
// // ─────────────────────────────────────────────────────

// pub fn session_layer(
//     redis: RedisPool,
// ) -> tower_sessions::SessionManagerLayer<tower_sessions_redis_store::RedisStore> {
//     use tower_sessions::{Expiry, SessionManagerLayer};
//     use tower_sessions_redis_store::RedisStore;

//     let store = RedisStore::new(redis);

//     // tower-sessions::Expiry::OnInactivity requires time::Duration
// specifically     // — there is no trait abstraction. We construct it from our
// SLIDING_TTL_SECS     // constant at this boundary and keep time isolated to
// this one call site.     let sliding_ttl =
// time::Duration::seconds(SLIDING_TTL_SECS);

//     SessionManagerLayer::new(store)
//         .with_secure(true)
//         .with_http_only(true)
//         .with_same_site(tower_sessions::cookie::SameSite::Lax)
//         .with_expiry(Expiry::OnInactivity(sliding_ttl))
// }

// // ── Helpers
// // ───────────────────────────────────────────────────────────────────

// fn user_sessions_key(user_id: Uuid) -> String {
// format!("user_sessions:{user_id}") }
