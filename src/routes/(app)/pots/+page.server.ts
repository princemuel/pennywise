import dbs from '$lib/content/db';
import { omit } from '@/helpers/object';
import db from '@/lib/server/data';
import { fail, redirect } from '@sveltejs/kit';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { PotChangeset } from './schema';

globalThis['__dirname'] = dirname(fileURLToPath(import.meta.url));

export const load: PageServerLoad = async ({ url }) => {
	const pots = dbs.pots;
	const id = url.searchParams.get('id');
	const intent = url.searchParams.get('intent') as 'edit' | 'delete' | null;

	const selected = await (async () => {
		let pot = null;
		if (id && intent) pot = await db.pots.get(id);
		return pot;
	})();

	const createPotForm = await superValidate(zod4(PotChangeset), { id: 'create-pot' });
	const editPotForm = await superValidate(selected, zod4(PotChangeset), { id: 'edit-pot' });

	return { pots, selected, intent, createPotForm, editPotForm };
};

export const actions = {
	create: async ({ request }) => {
		const createPotFormData = await superValidate(request, zod4(PotChangeset), {
			id: 'create-pot'
		});
		if (!createPotFormData.valid) return fail(400, { createPotFormData });

		const data = omit(createPotFormData.data, ['token']);

		await db.pots.create(data);
		redirect(303, '/pots');
	},

	edit: async ({ request, url }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Missing id' });

		const pot = await db.pots.get(id);
		if (!pot) return fail(404, { message: 'Pot not found' });

		const editPotFormData = await superValidate(request, zod4(PotChangeset), { id: 'edit-pot' });
		if (!editPotFormData.valid) return fail(400, { editPotFormData });

		const data = omit(editPotFormData.data, ['token']);
		console.log({ id, ...data });

		await db.pots.update(id, data);
		redirect(303, '/pots');
	},

	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Missing id' });

		const pot = await db.pots.get(id);
		if (!pot) return fail(404, { message: 'Pot not found' });

		await db.pots.remove(id);
		redirect(303, '/pots');
	}
} satisfies Actions;
