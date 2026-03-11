-- Add down migration script here
-- remove RLS from recurring_bill_payments.
DROP POLICY IF EXISTS recurring_bill_payments_isolation ON recurring_bill_payments;

ALTER TABLE recurring_bill_payments DISABLE ROW LEVEL SECURITY;
