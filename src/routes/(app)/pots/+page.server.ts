import db from '@/lib/content/db.server';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pots = db.pots;

	const id = url.searchParams.get('id');
	const intent = url.searchParams.get('intent') as 'edit' | 'delete' | null;

	const selected = id && intent ? pots.find((pot) => pot.id === id) : null;

	return { pots, selected, intent };
};

export const actions = {
	edit: async ({ request, url }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Missing id' });

		const form = await request.formData();
		const _ = form.get('title');
		// if (!title) return fail(400, { message: 'Missing title' });

		// await db.todo.update({
		//   where: { id },
		//   data: { title: String(title) }
		// });

		redirect(303, '/pots');
	},

	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Missing id' });

		const idx = db.pots.findIndex((pot) => pot.id === id);
		if (!idx) return fail(404, { message: 'Pot not found' });

		db.pots.splice(idx, 1);
		redirect(303, '/pots');
	}
} satisfies Actions;
