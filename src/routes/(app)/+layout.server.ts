import { parseSidebarCookie, sidebarCk } from '$lib/sidebar';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return { sidebar: parseSidebarCookie(cookies.get(sidebarCk)) };
};
