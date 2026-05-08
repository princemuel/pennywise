import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		timeZone: locals.timeZone,
		locale: locals.locale
	};
};
