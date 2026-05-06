import { sql } from 'drizzle-orm';
import {
	char,
	check,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

const timestamps = {
	created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true })
};

export const users = pgTable(
	'users',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`uuidv7()`),
		public_id: uuid('id').notNull().unique(),
		email: text('email').notNull().unique(),
		// ISO 4217 Currency code
		currency: char('currency', { length: 3 }).notNull().default('USD'),
		// Numeric for precision, defaults to 0
		balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('0'),
		...timestamps,
		deleted_at: timestamp('deleted_at', { withTimezone: true })
	},
	// Balance must be non-negative
	(t) => [check('balance_check', sql`${t.balance} >= 0`)]
);

export const merchants = pgTable(
	'merchants',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`uuidv7()`),
		public_id: uuid('public_id')
			.notNull()
			.unique()
			.default(sql`uuidv4()`),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		avatar_url: text('avatar_url'),
		...timestamps,
		deleted_at: timestamp('deleted_at', { withTimezone: true })
	},
	(t) => [
		// Unique constraint: A user can't have two merchants with the same name
		unique('uq_merchants_user_name').on(t.user_id, t.name),
		// GIN Trigram index for fuzzy search
		index('idx_merchants_name_trgm').using('gin', t.name.op('gin_trgm_ops'))
	]
);
export const categories = pgTable(
	'categories',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`uuidv7()`),
		public_id: uuid('public_id')
			.notNull()
			.unique()
			.default(sql`uuidv4()`),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		...timestamps
	},
	(t) => [
		// Unique constraint on user_id + name
		unique('uq_categories_user_name').on(t.user_id, t.name),
		// Check constraint for lowercase and length
		check(
			'chk_categories_name',
			sql`${t.name} = LOWER(${t.name}) AND CHAR_LENGTH(${t.name}) BETWEEN 1 AND 48`
		)
	]
);

const potTxnKindEnum = pgEnum('pot_transaction_kind', ['credit', 'debit']);
export const pots = pgTable(
	'pots',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`uuidv7()`),
		public_id: uuid('public_id')
			.notNull()
			.unique()
			.default(sql`uuidv4()`),
		user_id: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		// Hex Color Theme
		theme: char('theme', { length: 7 }).notNull(),
		target: numeric('target', { precision: 12, scale: 2 }).notNull(),
		total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
		...timestamps,
		deleted_at: timestamp('deleted_at', { withTimezone: true })
	},
	(t) => [
		unique('uq_pots_user_name').on(t.user_id, t.name),
		check('chk_pots_name', sql`char_length(${t.name}) BETWEEN 1 AND 48`),
		check('chk_pots_theme', sql`${t.theme} ~ '^#[0-9A-Fa-f]{6}$'`),
		check('chk_pots_target', sql`${t.target} > 0`),
		check('chk_pots_total', sql`${t.total} >= 0`)
	]
);

export const potTransactions = pgTable(
	'pot_transactions',
	{
		id: uuid('id')
			.primaryKey()
			.default(sql`uuidv7()`),
		pot_id: uuid('pot_id')
			.notNull()
			.references(() => pots.id, { onDelete: 'restrict' }),
		kind: potTxnKindEnum('kind').notNull(),
		amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
		created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('idx_pot_transactions_pot_id').on(t.pot_id),
		check('chk_amount_positive', sql`${t.amount} > 0`)
	]
);

// export * from './auth.schema';
