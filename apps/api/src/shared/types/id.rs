use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Id(pub Uuid);
impl Id {
    pub fn new() -> Self { Self(Uuid::now_v7()) }
}
