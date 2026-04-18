import { createCookieSessionStorage, redirect } from "react-router";

const authStore = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    secrets: [process.env.COOKIE_SECRET!], // add COOKIE_SECRET to your .env
    maxAge: 60 * 60, // 1 hour, match JWT_EXPIRY_SECS
    path: "/",
  },
});

export async function getAuthSession(request: Request) {
  return authStore.getSession(request.headers.get("Cookie"));
}

export async function commitAuthSession(session: Awaited<ReturnType<typeof getAuthSession>>) {
  return authStore.commitSession(session);
}

export async function getAuthToken(request: Request): Promise<string | null> {
  const session = await getAuthSession(request);
  return session.get("token") ?? null;
}

export async function createAuthSession(token: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("token", token);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await authStore.commitSession(session) },
  });
}

export async function destroyAuthSession(request: Request) {
  const session = await getAuthSession(request);
  return redirect("/", {
    headers: { "Set-Cookie": await authStore.destroySession(session) },
  });
}

export async function requireAuth(request: Request): Promise<string> {
  const token = await getAuthToken(request);
  if (!token) {
    const url = new URL(request.url);
    throw redirect(`/?returnTo=${encodeURIComponent(url.pathname)}`);
  }
  return token;
}
