import { isbot } from "isbot";

import type { MiddlewareHandler } from "astro";

export const botcheck: MiddlewareHandler = async ({ request, locals }, next) => {
  if (request.url.includes("com.chrome.devtools")) {
    return new Response(null, { status: 204 });
  }

  if (!request.url.includes("/api/")) return next();

  const userAgent = request.headers.get("User-Agent") || "";

  const isMissingUA = !userAgent;

  const isABot = isbot(userAgent);

  // Add bot detection info to locals for use in routes
  locals.botinfo.isBot ??= isABot || isMissingUA;

  if (request.url.includes("/api/") && locals.botinfo.isBot) {
    return new Response("This endpoint is not available for bots", { status: 403 });
  }

  return next();
};
