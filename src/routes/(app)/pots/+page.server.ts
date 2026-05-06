import db from '@/lib/content/db.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { pots: db.pots };
};
