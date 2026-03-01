-- Add up migration script here
-- v_balance: per-user balance computed from transactions (always accurate).
-- Usage: SELECT * FROM v_balance WHERE user_id = $1
CREATE VIEW v_balance AS
SELECT user_id,
    COALESCE(
        SUM(amount) FILTER (
            WHERE direction = 'credit'
        ),
        0.00
    ) AS income,
    COALESCE(
        SUM(amount) FILTER (
            WHERE direction = 'debit'
        ),
        0.00
    ) AS expenses,
    COALESCE(
        SUM(amount) FILTER (
            WHERE direction = 'credit'
        ) - SUM(amount) FILTER (
            WHERE direction = 'debit'
        ),
        0.00
    ) AS current
FROM transactions
GROUP BY user_id;
-- v_budget_spending: per-user budget vs actual spending for the current calendar month.
-- Usage: SELECT * FROM v_budget_spending WHERE user_id = $1
CREATE VIEW v_budget_spending AS
SELECT b.user_id,
    b.id AS budget_id,
    b.maximum,
    b.theme,
    c.name AS category,
    COALESCE(SUM(t.amount), 0.00) AS spent,
    b.maximum - COALESCE(SUM(t.amount), 0.00) AS remaining
FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON t.user_id = b.user_id
    AND t.category_id = b.category_id
    AND t.direction = 'debit'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', NOW())
WHERE b.deleted_at IS NULL
GROUP BY b.user_id,
    b.id,
    b.maximum,
    b.theme,
    c.name;
-- v_recurring_bill_summary: per-user bill summary for the current calendar month.
-- Usage: SELECT * FROM v_recurring_bill_summary WHERE user_id = $1
CREATE VIEW v_recurring_bill_summary AS
SELECT rb.user_id,
    COUNT(*) FILTER (
        WHERE rbp.paid_at IS NOT NULL
    ) AS paid_count,
    SUM(rb.amount) FILTER (
        WHERE rbp.paid_at IS NOT NULL
    ) AS paid_amount,
    COUNT(*) FILTER (
        WHERE rbp.paid_at IS NULL
            AND rbp.deadline > CURRENT_DATE
    ) AS upcoming_count,
    SUM(rb.amount) FILTER (
        WHERE rbp.paid_at IS NULL
            AND rbp.deadline > CURRENT_DATE
    ) AS upcoming_amount,
    -- Due soon = unpaid and due within 7 days
    COUNT(*) FILTER (
        WHERE rbp.paid_at IS NULL
            AND rbp.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    ) AS due_soon_count,
    SUM(rb.amount) FILTER (
        WHERE rbp.paid_at IS NULL
            AND rbp.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    ) AS due_soon_amount
FROM recurring_bill_payments rbp
    JOIN recurring_bills rb ON rb.id = rbp.bill_id
WHERE DATE_TRUNC('month', rbp.deadline) = DATE_TRUNC('month', CURRENT_DATE)
    AND rb.deleted_at IS NULL
    AND rb.is_active = TRUE
GROUP BY rb.user_id;
