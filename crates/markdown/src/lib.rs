mod utils;

#[must_use]
pub fn add(left: u32, right: u32) -> u32 {
    utils::panic_hook::set_panic_hook();
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(4, add(2, 2));
    }
}
