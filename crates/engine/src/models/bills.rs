use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Bill {
    // TODO: Define bill structure
    pub id: Uuid,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CreateBillRequest {
    // TODO: Define create bill request
}
