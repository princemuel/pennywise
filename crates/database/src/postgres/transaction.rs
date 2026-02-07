use pennapi_core::errors::DBError;
use pennapi_core::models::*;
use pennapi_core::repos::{TransactionEntryRepository, TransactionRepository};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct TransactionRepo(PgPool);
impl TransactionRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl TransactionRepository for TransactionRepo {
    async fn find_many(
        &self,
        args: TransactionFilterArgs,
    ) -> Result<Vec<Transaction>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(
        &self,
        args: TransactionFilterArgs,
    ) -> Result<Option<Transaction>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(&self, params: &TransactionCreateParams) -> Result<Transaction, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(
        &self,
        id: Uuid,
        params: &TransactionUpdateParams,
    ) -> Result<Transaction, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn delete(&self, id: Uuid) -> Result<bool, DBError> {
        // TODO: Implement
        Ok(false)
    }
}

#[derive(Debug, Clone)]
pub struct TransactionEntryRepo(PgPool);

impl TransactionEntryRepo {
    pub fn new(pool: PgPool) -> Self { Self(pool) }
}

#[async_trait::async_trait]
impl TransactionEntryRepository for TransactionEntryRepo {
    async fn find_many(
        &self,
        args: TransactionEntryFilterArgs,
    ) -> Result<Vec<TransactionEntry>, DBError> {
        // TODO: Implement
        Ok(vec![])
    }

    async fn find_unique(
        &self,
        args: TransactionEntryFilterArgs,
    ) -> Result<Option<TransactionEntry>, DBError> {
        // TODO: Implement
        Ok(None)
    }

    async fn create(
        &self,
        params: &TransactionEntryCreateParams,
    ) -> Result<TransactionEntry, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn update(
        &self,
        id: Uuid,
        params: &TransactionEntryUpdateParams,
    ) -> Result<TransactionEntry, DBError> {
        // TODO: Implement
        Err(DBError::Internal {
            message: "Not implemented".to_string(),
        })
    }

    async fn compute_account_balance(
        &self,
        account_id: Uuid,
    ) -> Result<rust_decimal::Decimal, DBError> {
        // TODO: Implement
        Ok(rust_decimal::Decimal::ZERO)
    }

    async fn delete(&self, id: Uuid) -> Result<bool, DBError> {
        // TODO: Implement
        Ok(false)
    }
}
