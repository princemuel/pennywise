import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from "react-router";

import "@fontsource-variable/public-sans";
import "temporal-polyfill/global";
import "./global.css";

import type { Route } from "./+types/root";
import { userPrefs } from "./cookies.server";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "favicon.svg" },
];

type Props = React.ComponentPropsWithRef<"div">;

export async function loader({ request }: Route.LoaderArgs) {
  // oxlint-disable-next-line typescript/strict-boolean-expressions
  const cookie = (await userPrefs.parse(request.headers.get("Cookie"))) || {};
  return {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    minimize: (cookie.minimize ?? true) as boolean,
    url: new URL("/", import.meta.env.PUBLIC_SITE_URL).toString(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  // oxlint-disable-next-line typescript/strict-boolean-expressions
  const cookie = (await userPrefs.parse(request.headers.get("Cookie"))) || {};
  const formData = await request.formData();
  cookie.minimize = formData.get("minimize") === "true";
  return redirect("/", { headers: { "Set-Cookie": await userPrefs.serialize(cookie) } });
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: "Pennywise - Smart Personal Finance Management" },
    {
      name: "description",
      content:
        "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health. Free personal finance app with bank-level security.",
    },
    {
      name: "keywords",
      content:
        "personal finance, personal finance software, budget tracker, budget planner, expense tracking, track expenses, savings goals, financial planning, money management, budget app, spending tracker, financial wellness",
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: data?.url ?? "https://pennywise.app" },
    { property: "og:title", content: "Pennywise - Smart Personal Finance Management" },
    {
      property: "og:description",
      content:
        "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
    },
    { property: "og:site_name", content: "Pennywise" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: data?.url ?? "https://pennywise.app" },
    { name: "twitter:title", content: "Pennywise - Smart Personal Finance Management" },
    {
      name: "twitter:description",
      content:
        "Take control of your finances. Track spending, manage budgets, reach savings goals, and gain financial insights with Pennywise.",
    },
    { name: "twitter:creator", content: "@pennywise" },

    // Additional SEO tags
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Pennywise" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#10B981" },

    // Mobile app capabilities
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "mobile-web-app-status-bar-style", content: "default" },
    { name: "mobile-web-app-title", content: "Pennywise" },

    // Security and privacy signals
    { "http-equiv": "Content-Security-Policy", content: "upgrade-insecure-requests" },
  ];
};

export function Layout({ children }: Props) {
  return <Root>{children}</Root>;
}

function Root({ children }: Props) {
  return (
    <html lang="en" className="motion-safe:scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="relative min-h-svh bg-beige-100 font-sans text-base font-normal antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error != null && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack != null && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
