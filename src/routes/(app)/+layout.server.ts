import { parseSidebarCookie, SIDEBAR_COOKIE } from '@/lib/cookies';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return { sidebar: parseSidebarCookie(cookies.get(SIDEBAR_COOKIE)) };
};
