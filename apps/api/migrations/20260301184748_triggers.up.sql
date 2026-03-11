-- Add migration script here
-- Reusable trigger function for auto-updating updated_at columns.
-- Applied to any table that has an updated_at column.
CREATE OR REPLACE FUNCTION set_updated_at () RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to keep pots.total in sync with pot_transactions.
-- Fires after every insert/update/delete on pot_transactions.
-- This replaces the previous app-logic contract, which was fragile and
-- could silently corrupt pot balances on any missed code path.
CREATE OR REPLACE FUNCTION sync_pot_total () RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'DELETE' THEN
UPDATE pots
SET total = COALESCE(
        (
            SELECT SUM(amount)
            FROM pot_transactions
            WHERE pot_id = OLD.pot_id
        ),
        0.00
    )
WHERE id = OLD.pot_id;
ELSE
UPDATE pots
SET total = COALESCE(
        (
            SELECT SUM(amount)
            FROM pot_transactions
            WHERE pot_id = NEW.pot_id
        ),
        0.00
    )
WHERE id = NEW.pot_id;
END IF;
RETURN NULL;
-- AFTER trigger; return value ignored
END;
$$ LANGUAGE plpgsql;
