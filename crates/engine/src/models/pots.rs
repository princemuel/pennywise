use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Pot {
    // TODO: Define pot structure
    pub id: Uuid,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreatePotRequest {
    // TODO: Define create pot request
}
