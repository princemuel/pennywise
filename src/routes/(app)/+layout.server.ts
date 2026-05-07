import { parseSidebarCookie, SIDEBAR_COOKIE } from '@/lib/cookies';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sidebar = parseSidebarCookie(cookies.get(SIDEBAR_COOKIE));
	return { state: { sidebar } };
};
