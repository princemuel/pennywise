import db from '@/lib/content/db.server';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pots = db.pots;

	const id = url.searchParams.get('id');
	const modal = url.searchParams.get('modal') as 'edit' | 'delete' | null;

	const selected = id && modal ? pots.find((pot) => pot.id === id) : null;

	return { pots, selected, modal };
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

		// await db.todo.delete({ where: { id } });

		redirect(303, '/pots');
	}
} satisfies Actions;
