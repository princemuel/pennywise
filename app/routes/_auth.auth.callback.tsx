import { createAuthSession } from "@/lib/auth.server";

import type { Route } from "./+types/_auth.auth.callback";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectTo = url.searchParams.get("redirectTo") ?? "/dashboard";
  if (!token) throw new Response("Missing token", { status: 401 });

  // Store token in httpOnly cookie and redirect to dashboard.
  // The ?token= is gone from the URL immediately; it never hits the browser history
  // in a way that persists, and never touches localStorage.
  return createAuthSession(token, redirectTo);
}

export default function Page() {
  return null;
}
