import { isBrowser } from '@/helpers/is-browser';
import { secs } from '@/helpers/time';

export const sidebarCk = '__pm_sidebar' as const;
const sidebarMaxAge = secs({ days: 28 });

export const parseSidebarCookie = (value: unknown): string =>
	value === 'compact' ? 'compact' : 'full';

export const setSidebarCookie = async (value: string) => {
	if (!isBrowser) return;
	if ('cookieStore' in window) {
		await cookieStore.set({
			name: sidebarCk,
			value,
			expires: Temporal.Now.instant().epochMilliseconds + sidebarMaxAge * 1000,
			path: '/',
			sameSite: 'lax'
		});
	} else {
		const secure = import.meta.env.PROD ? '; Secure' : '';
		const maxAge = `; Max-Age=${sidebarMaxAge}`;
		document.cookie = `${sidebarCk}=${value}; path=/; SameSite=Lax${secure}${maxAge}`;
	}
};

// Client-side async cookie getter (optional, for cross-tab sync)
export const getSidebarCookie = async () => {
	if (!isBrowser) return 'full';
	if ('cookieStore' in window) {
		const cookie = await cookieStore.get(sidebarCk);
		return parseSidebarCookie(cookie?.value);
	} else {
		const match = document.cookie.match(new RegExp(`${sidebarCk}=([^;]+)`));
		return parseSidebarCookie(match?.[1]);
	}
};
