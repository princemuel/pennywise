/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  clearBrowserExtensionInjectionsBeforeHydration();
  const root = hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
    {
      onRecoverableError: () => {
        console.error("Hydration failed! Attempting recovery...");
        root.render(
          <StrictMode>
            <RemixBrowser />
          </StrictMode>,
        );
        console.info("Recovery successful!");
      },
    },
  );
});

function clearBrowserExtensionInjectionsBeforeHydration() {
  const nodes = document.querySelectorAll(
    [
      "html > *:not(body, head)",
      'script[src*="extension://"]',
      'link[href*="extension://"]',
    ].join(", "),
  );

  for (const node of nodes) node.parentNode?.removeChild(node);
  const $targets = {
    html: {
      // biome-ignore lint/style/noNonNullAssertion: this is always defined
      $elm: document.querySelector("html")!,
      allowedAttributes: ["lang", "dir", "class"],
    },
    head: {
      // biome-ignore lint/style/noNonNullAssertion: this is always defined
      $elm: document.querySelector("head")!,
      allowedAttributes: [""],
    },
    body: {
      // biome-ignore lint/style/noNonNullAssertion: this is always defined
      $elm: document.querySelector("body")!,
      allowedAttributes: ["class"],
    },
  };

  for (const target of Object.values($targets)) {
    for (const attr of target.$elm.getAttributeNames()) {
      if (!target.allowedAttributes.includes(attr))
        target.$elm.removeAttribute(attr);
    }
  }
}
