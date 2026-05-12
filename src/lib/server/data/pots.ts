import { v7 as uuidv7 } from 'uuid';

import { read, write } from './utils';

type Pot = Database['pots'][0];

export async function list() {
	const db = await read();
	return db.pots;
}

export async function get(id: string): Promise<Pot | null> {
	const db = await read();
	const pot = db.pots.find((pot) => pot.id === id);
	return pot ?? null;
}

export async function create(data: Omit<Pot, 'id'>): Promise<Pot> {
	const db = await read();
	const pot: Pot = { id: uuidv7(), ...data };
	db.pots.push(pot);

	await write(db);
	return pot;
}

export async function update(id: string, data: Partial<Omit<Pot, 'id'>>): Promise<Pot | null> {
	const db = await read();
	const pot = db.pots.find((pot) => pot.id === id);
	if (!pot) return null;

	Object.assign(pot, data);

	await write(db);

	return pot;
}

export async function remove(id: string) {
	const db = await read();

	const exists = db.pots.some((p) => p.id === id);
	if (!exists) return false;

	db.pots = db.pots.filter((p) => p.id !== id);

	await write(db);

	return true;
}
