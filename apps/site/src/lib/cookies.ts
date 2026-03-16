import { isBrowser } from "@/helpers/is-browser";
import { secs } from "@/helpers/time";

export const SIDEBAR_COOKIE = "pfm_sidebar_state" as const;
export const SIDEBAR_MAX_AGE = secs({ d: 7 });

const isProduction = import.meta.env.PROD;

export const parseSidebarCookie = (value: unknown): SidebarState =>
  value === "compact" ? "compact" : "default";

export const setSidebarCookieHeader = (value: SidebarState): string => {
  const secure = isProduction ? "; secure" : "";
  return `${SIDEBAR_COOKIE}=${value}; max-age=${SIDEBAR_MAX_AGE}; path=/; samesite=lax${secure}`;
};

export const setSidebarCookieClient = async (value: SidebarState) => {
  if (!isBrowser) return;
  if ("cookieStore" in window) {
    const expires = Date.now() + SIDEBAR_MAX_AGE * 1000;
    await cookieStore.set({ name: SIDEBAR_COOKIE, value, expires, path: "/", sameSite: "lax" });
  } else {
    document.cookie = setSidebarCookieHeader(value);
  }
};

// Client-side async cookie getter (optional, for cross-tab sync)
export const getSidebarCookieClient = async (): Promise<SidebarState> => {
  if (!isBrowser) return "default";
  if ("cookieStore" in window) {
    const cookie = await cookieStore.get(SIDEBAR_COOKIE);
    return parseSidebarCookie(cookie?.value);
  } else {
    const match = document.cookie.match(new RegExp(`${SIDEBAR_COOKIE}=([^;]+)`));
    return parseSidebarCookie(match?.[1]);
  }
};
