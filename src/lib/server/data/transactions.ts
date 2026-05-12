import { v7 as uuidv7 } from 'uuid';

import { read, write } from './utils';

type Transaction = Database['transactions'][0];

export async function list() {
	const db = await read();
	return db.transactions;
}

export async function get(id: string): Promise<Transaction | null> {
	const db = await read();
	return db.transactions.find((txn) => txn.id === id) ?? null;
}

export async function create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
	const db = await read();
	const transaction: Transaction = { id: uuidv7(), ...data };
	db.transactions.push(transaction);

	await write(db);
	return transaction;
}

export async function update(
	id: string,
	data: Partial<Omit<Transaction, 'id'>>
): Promise<Transaction | null> {
	const db = await read();
	const txn = db.transactions.find((txn) => txn.id === id);
	if (!txn) return null;

	Object.assign(txn, data);

	await write(db);

	return txn;
}

export async function remove(id: string) {
	const db = await read();

	const exists = db.transactions.some((p) => p.id === id);
	if (!exists) return false;

	db.transactions = db.transactions.filter((p) => p.id !== id);

	await write(db);

	return true;
}
