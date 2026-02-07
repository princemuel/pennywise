use core::ops::Deref;

use uuid::Uuid;

#[derive(Copy, Clone, Debug)]
pub struct UserId(Uuid);

impl core::fmt::Display for UserId {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result { self.0.fmt(f) }
}

impl Deref for UserId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target { &self.0 }
}
