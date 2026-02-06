import { createServerFn } from "@tanstack/react-start";

import { secs } from "@/helpers/time";

type JSONValue = string | number | boolean | null | undefined;

export const getUserPrefs = createServerFn({ method: "GET" }, async (ctx: any) => {
  // Get cookies from request headers
  const cookieHeader = ctx.request?.headers?.get?.("cookie") || "";
  const userPrefs = parseCookie(cookieHeader, "user-prefs");
  return userPrefs ? (JSON.parse(userPrefs) as Record<string, JSONValue>) : { mini: false };
});

export const setUserPrefs = createServerFn(
  { method: "POST" },
  async (values: unknown, ctx: any) => {
    const cookieValue = JSON.stringify(values);
    const maxAge = secs({ d: 7 });
    const setCookie = `user-prefs=${cookieValue}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`;

    // Return cookie header to be set by the response
    return { setCookie };
  },
);

function parseCookie(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}
