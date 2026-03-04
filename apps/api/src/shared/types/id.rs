use uuid::Uuid;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct Id(pub Uuid);
impl Id {
    pub fn new() -> Self { Self(Uuid::now_v7()) }
}
