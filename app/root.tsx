import styles from "@/assets/styles/global.css?url";
import "@fontsource-variable/public-sans";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import { Fragment, useEffect } from "react";
import { getToast } from "remix-toast";
import { Toaster as ToastProvider, toast as notify } from "sonner";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Indicator } from "./components/indicator";
import { SkipNavLink } from "./components/skip-link";
import { useNonce } from "./context/nonce-provider";

export const links: LinksFunction = () => {
  return [
    // {
    //   rel: "icon",
    //   href: "/favicon.ico",
    //   sizes: "48x48",
    // },
    // {
    //   rel: "icon",
    //   type: "image/png",
    //   href: "/favicon-16x16.png",
    //   sizes: "16x16",
    // },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-32x32.png",
      sizes: "32x32",
    },
    // {
    //   rel: "apple-touch-icon",
    //   href: "/apple-touch-icon.png",
    //   sizes: "180x180",
    // },
    // {
    //   rel: "manifest",
    //   href: "/site.webmanifest",
    //   crossOrigin: "anonymous",
    // } as const,
    { rel: "stylesheet", href: styles },
  ].filter(Boolean);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request);
  const t = { type: "", message: "", description: "", duration: 5000 };
  return json({ config: {}, toast: toast ?? t }, { headers });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const t = data.toast;
  useEffect(() => {
    const methods = new Map([
      ["error", notify.error],
      ["success", notify.success],
      ["info", notify.info],
      ["warning", notify.warning],
      ["message", notify.message],
      ["loading", notify.loading],
    ]);
    const toast = methods.get(t.type);
    if (t.type && t.message && toast) toast(t.message, { duration: 4000 });
  }, [t.message, t.type]);

  return (
    <Fragment>
      <div className="relative min-h-screen">
        <SkipNavLink />

        <Outlet />

        <ToastProvider richColors closeButton position="top-center" />
        <Indicator />
      </div>
    </Fragment>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>();
  const nonce = useNonce();
  return (
    // @ts-expect-error
    <Document nonce={nonce} env={data?.config}>
      {children}
    </Document>
  );
}

export function ErrorBoundary() {
  const nonce = useNonce();
  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}

function Document({
  children,
  nonce,
  env = {},
}: {
  children: React.ReactNode;
  nonce: string;
  env?: Record<string, string>;
}) {
  const index = env.INDEX !== "false";
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {index ? null : <meta name="robots" content="noindex, nofollow" />}
        <Links />
      </head>

      <body className="min-h-screen font-normal font-sans antialiased">
        {children}
        <script
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: `window.config = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
