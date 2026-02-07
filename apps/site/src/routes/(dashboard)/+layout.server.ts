import { parseSidebarCookie, SIDEBAR_COOKIE } from "@/lib/cookies";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const sidebarState = parseSidebarCookie(cookies.get(SIDEBAR_COOKIE));
  return { sidebarState };
};
