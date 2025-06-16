import { isbot } from "isbot";

import type { MiddlewareHandler } from "astro";

export const botcheck: MiddlewareHandler = async ({ request, locals }, next) => {
  if (request.url.includes("com.chrome.devtools")) return new Response(null, { status: 204 });

  if (!request.url.includes("/api/")) return next();

  const userAgent = request.headers.get("User-Agent") || "";

  //@ts-expect-error just ignore this
  locals.botinfo ??= {};
  locals.botinfo.isBot = isbot(userAgent);
  locals.botinfo.isMissingUA = !userAgent;
  locals.botinfo.blocked = locals.botinfo.isBot || locals.botinfo.isMissingUA;

  if (!locals.botinfo.blocked) return next();

  return new Response("This endpoint is not available for bots", { status: 403 });
};
