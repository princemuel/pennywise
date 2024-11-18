import { PassThrough } from "node:stream";

import type {
  HandleDocumentRequestFunction,
  HandleErrorFunction,
} from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, isRouteErrorResponse } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

import { NonceProvider } from "@/context/nonce-provider";

// Reject/Cancel all pending promises after 5 seconds
export const streamTimeout = 5000;

export default async function handleRequest(
  ...args: Parameters<HandleDocumentRequestFunction>
) {
  const [request, status, headers, context, load_context] = args;

  const callback = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  const nonce = load_context.cspNonce?.toString() || "";

  return new Promise((resolve, reject) => {
    let failed = false;
    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer context={context} url={request.url} />
      </NonceProvider>,
      {
        [callback]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          headers.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: headers,
              status: failed ? 500 : status,
            }),
          );
          pipe(body);
        },
        onShellError: (e) => {
          reject(e);
        },
        onError: () => {
          failed = true;
        },
        nonce,
      },
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}

export const handleError: HandleErrorFunction = async (error, { request }) => {
  // Skip capturing if the request is aborted as Remix docs suggest
  // Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
  if (request.signal.aborted) return;
  if (isRouteErrorResponse(error)) return console.error(error);
  if (error instanceof Error) console.error(error.stack);
  else console.error(error);
};
