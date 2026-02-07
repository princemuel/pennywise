use uuid::Uuid;

use crate::errors::DBError;
use crate::models::*;

#[async_trait::async_trait]
pub trait TransactionRepository: Send + Sync {
    async fn create(
        &self,
        user_id: Uuid,
        input: &CreateTransactionRequest,
    ) -> Result<Transaction, DBError>;

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Transaction>, DBError>;

    /// Paginated list, newest first.
    async fn find_by_user(
        &self,
        user_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Transaction>, DBError>;

    /// Aggregate: sum of `amount` for a user in a given month.
    /// If `category_id` is `Some`, the sum is scoped to that category.
    /// Returns `Decimal::ZERO` when there are no matching rows (never
    /// `NotFound`).
    async fn sum_by_user_and_month(
        &self,
        user_id: Uuid,
        month: chrono::NaiveDate,
        category_id: Option<Uuid>,
    ) -> Result<rust_decimal::Decimal, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
