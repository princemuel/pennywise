import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const path = resolve('src/lib/content/db.json');

export async function read(): Promise<Database> {
	const file = await readFile(path, 'utf8');
	return JSON.parse(file) as Database;
}

export async function write(data: Database) {
	await writeFile(path, JSON.stringify(data) + '\n');
}
