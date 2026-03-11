-- Add up migration script here
-- v_balance: per-user balance computed from transactions.
-- NOTE: This view aggregates the full transaction history per user.
-- For large datasets, consider a materialised view refreshed periodically,
-- or a running_balance column maintained by trigger.
-- Usage: SELECT * FROM v_balance WHERE user_id = $1
CREATE VIEW v_balance AS
SELECT
    user_id,
    COALESCE(
        SUM(amount) FILTER (
            WHERE
                kind = 'credit'
        ),
        0.00
    ) AS income,
    COALESCE(
        SUM(amount) FILTER (
            WHERE
                kind = 'debit'
        ),
        0.00
    ) AS expenses,
    COALESCE(
        SUM(amount) FILTER (
            WHERE
                kind = 'credit'
        ) - SUM(amount) FILTER (
            WHERE
                kind = 'debit'
        ),
        0.00
    ) AS current
FROM
    transactions
GROUP BY
    user_id;


-- v_budget_spending: per-user budget vs actual spending for a given calendar month.
-- The target month is passed as a session variable: SET app.budget_month = '2024-08-01';
-- Defaults to the current calendar month if not set.
--
-- Usage:
--   SET app.budget_month = '2024-07-01';
--   SELECT * FROM v_budget_spending WHERE user_id = $1;
--
-- This replaces the hardcoded NOW() in the original view, enabling
-- historical month queries without rewriting SQL.
CREATE VIEW v_budget_spending AS
SELECT
    b.user_id,
    b.id AS budget_id,
    b.maximum,
    b.theme,
    c.name AS category,
    COALESCE(SUM(t.amount), 0.00) AS spent,
    b.maximum - COALESCE(SUM(t.amount), 0.00) AS remaining
FROM
    budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON t.user_id = b.user_id AND
    t.category_id = b.category_id AND
    t.kind = 'debit' AND
    DATE_TRUNC('month', t.date) = DATE_TRUNC(
        'month',
        COALESCE(
            CURRENT_SETTING('app.budget_month', TRUE)::TIMESTAMPTZ,
            NOW()
        )
    )
WHERE
    b.deleted_at IS NULL
    -- Only include budgets that were active during the requested month
    AND
    b.valid_from <= DATE_TRUNC(
        'month',
        COALESCE(
            CURRENT_SETTING('app.budget_month', TRUE)::TIMESTAMPTZ,
            NOW()
        )
    ) + INTERVAL '1 month - 1 second' AND
    (
        b.valid_to IS NULL OR
        b.valid_to >= DATE_TRUNC(
            'month',
            COALESCE(
                CURRENT_SETTING('app.budget_month', TRUE)::TIMESTAMPTZ,
                NOW()
            )
        )
    )
GROUP BY
    b.user_id,
    b.id,
    b.maximum,
    b.theme,
    c.name;


-- v_recurring_bill_summary: per-user bill summary for the current calendar month.
-- Adds overdue_count/overdue_amount (missing from original).
-- paid     = paid_at NOT NULL
-- upcoming = unpaid, deadline in the future (> today)
-- due_soon = unpaid, deadline within 7 days (subset of upcoming)
-- overdue  = unpaid, deadline is in the past
-- Usage: SELECT * FROM v_recurring_bill_summary WHERE user_id = $1
CREATE VIEW v_recurring_bill_summary AS
SELECT
    rb.user_id,
    COUNT(*) FILTER (
        WHERE
            rbp.paid_at IS NOT NULL
    ) AS paid_count,
    COALESCE(
        SUM(rb.amount) FILTER (
            WHERE
                rbp.paid_at IS NOT NULL
        ),
        0.00
    ) AS paid_amount,
    COUNT(*) FILTER (
        WHERE
            rbp.paid_at IS NULL AND
            rbp.deadline > CURRENT_DATE
    ) AS upcoming_count,
    COALESCE(
        SUM(rb.amount) FILTER (
            WHERE
                rbp.paid_at IS NULL AND
                rbp.deadline > CURRENT_DATE
        ),
        0.00
    ) AS upcoming_amount,
    -- Due soon: unpaid and due within 7 days (inclusive of today)
    COUNT(*) FILTER (
        WHERE
            rbp.paid_at IS NULL AND
            rbp.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE  + INTERVAL '7 days'
    ) AS due_soon_count,
    COALESCE(
        SUM(rb.amount) FILTER (
            WHERE
                rbp.paid_at IS NULL AND
                rbp.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE  + INTERVAL '7 days'
        ),
        0.00
    ) AS due_soon_amount,
    -- Overdue: unpaid and deadline has already passed
    COUNT(*) FILTER (
        WHERE
            rbp.paid_at IS NULL AND
            rbp.deadline < CURRENT_DATE
    ) AS overdue_count,
    COALESCE(
        SUM(rb.amount) FILTER (
            WHERE
                rbp.paid_at IS NULL AND
                rbp.deadline < CURRENT_DATE
        ),
        0.00
    ) AS overdue_amount
FROM
    recurring_bill_payments rbp
    JOIN recurring_bills rb ON rb.id = rbp.bill_id
WHERE
    DATE_TRUNC('month', rbp.deadline) = DATE_TRUNC('month', CURRENT_DATE) AND
    rb.deleted_at IS NULL AND
    rb.is_active = TRUE
GROUP BY
    rb.user_id;


-- v_pot_summary: per-user pot overview including progress toward target.
-- Pot total is maintained by trigger; this view just formats it for display.
-- Usage: SELECT * FROM v_pot_summary WHERE user_id = $1
CREATE VIEW v_pot_summary AS
SELECT
    user_id,
    COUNT(*) FILTER (
        WHERE
            deleted_at IS NULL
    ) AS active_pot_count,
    COALESCE(
        SUM(total) FILTER (
            WHERE
                deleted_at IS NULL
        ),
        0.00
    ) AS total_saved,
    COALESCE(
        SUM(target) FILTER (
            WHERE
                deleted_at IS NULL
        ),
        0.00
    ) AS total_target
FROM
    pots
GROUP BY
    user_id;
