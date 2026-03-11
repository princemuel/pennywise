-- Add up migration script here
-- PATCH: add row-level security to recurring_bill_payments.
-- This table was the only user-data table missing RLS.
-- Without it, a connection with app.current_user_id unset (or wrong) could read
-- or modify another user's payment records via a direct query.
--
-- recurring_bill_payments has no user_id column, so the policy joins through
-- recurring_bills to check ownership. This is consistent with how the table
-- is queried in practice (always via bill_id).
--
-- NOTE: if query plans on this policy become a concern at scale, adding a
-- denormalised user_id column (as done on pot_transactions) is the escape hatch.
ALTER TABLE recurring_bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY recurring_bill_payments_isolation ON recurring_bill_payments USING (
    EXISTS (
        SELECT
            1
        FROM
            recurring_bills rb
        WHERE
            rb.id = recurring_bill_payments.bill_id AND
            rb.user_id = CURRENT_SETTING('app.current_user_id', TRUE)::UUID
    )
);
