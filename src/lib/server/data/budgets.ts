import { v7 as uuidv7 } from 'uuid';

import { read, write } from './utils';

type Budget = Database['budgets'][0];

export async function list() {
	const db = await read();
	return db.budgets;
}

export async function get(id: string): Promise<Budget | null> {
	const db = await read();
	return db.budgets.find((txn) => txn.id === id) ?? null;
}

export async function create(data: Omit<Budget, 'id'>): Promise<Budget> {
	const db = await read();
	const budget: Budget = { id: uuidv7(), ...data };
	db.budgets.push(budget);

	await write(db);
	return budget;
}

export async function update(
	id: string,
	data: Partial<Omit<Budget, 'id'>>
): Promise<Budget | null> {
	const db = await read();
	const budget = db.budgets.find((txn) => txn.id === id);
	if (!budget) return null;

	Object.assign(budget, data);

	await write(db);

	return budget;
}

export async function remove(id: string) {
	const db = await read();

	const exists = db.budgets.some((p) => p.id === id);
	if (!exists) return false;

	db.budgets = db.budgets.filter((p) => p.id !== id);

	await write(db);

	return true;
}
