-- Add down migration script here
-- Drop payments first: FK references recurring_bills and transactions.
-- Indexes, policies, and RLS drop automatically with each table.
DROP TABLE IF EXISTS recurring_bill_payments CASCADE;

DROP TABLE IF EXISTS recurring_bills CASCADE;
