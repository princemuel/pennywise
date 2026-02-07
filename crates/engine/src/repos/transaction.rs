use uuid::Uuid;

use crate::errors::DBError;
use crate::models::{
    Transaction,
    TransactionCreateParams,
    TransactionEntry,
    TransactionEntryCreateParams,
    TransactionEntryFilterArgs,
    TransactionEntryUpdateParams,
    TransactionFilterArgs,
    TransactionUpdateParams,
};

#[async_trait::async_trait]
pub trait TransactionRepository: Send + Sync {
    async fn find_many(&self, args: TransactionFilterArgs)
    -> Result<Vec<Transaction>, DBError>;

    async fn find_unique(
        &self,
        args: TransactionFilterArgs,
    ) -> Result<Option<Transaction>, DBError>;

    async fn create(&self, params: &TransactionCreateParams) -> Result<Transaction, DBError>;

    async fn update(
        &self,
        id: Uuid,
        params: &TransactionUpdateParams,
    ) -> Result<Transaction, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}

#[async_trait::async_trait]
pub trait TransactionEntryRepository: Send + Sync {
    async fn find_many(
        &self,
        args: TransactionEntryFilterArgs,
    ) -> Result<Vec<TransactionEntry>, DBError>;

    async fn find_unique(
        &self,
        args: TransactionEntryFilterArgs,
    ) -> Result<Option<TransactionEntry>, DBError>;

    async fn create(
        &self,
        params: &TransactionEntryCreateParams,
    ) -> Result<TransactionEntry, DBError>;

    async fn update(
        &self,
        id: Uuid,
        params: &TransactionEntryUpdateParams,
    ) -> Result<TransactionEntry, DBError>;

    /// Compute balance for an account (sum of all entries)
    async fn compute_account_balance(
        &self,
        account_id: Uuid,
    ) -> Result<rust_decimal::Decimal, DBError>;

    async fn delete(&self, id: Uuid) -> Result<bool, DBError>;
}
