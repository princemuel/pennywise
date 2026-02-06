import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import "temporal-polyfill/global";

import styles from "@/global.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
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
      { name: "robots", content: "index, follow" },

      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pennywise.com" },
      { property: "og:title", content: "Pennywise - Smart Personal Finance Management" },
      {
        property: "og:description",
        content:
          "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
      },
      { property: "og:site_name", content: "Pennywise" },
      { property: "og:image", content: "https://pennywise.com/og.png" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@site" },
      { name: "twitter:creator", content: "@pennywise" },
      { name: "twitter:title", content: "Pennywise - Smart Personal Finance Management" },
      {
        name: "twitter:description",
        content:
          "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
      },
      { name: "twitter:image", content: "https://pennywise.com/og.png" },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", href: "favicon.svg" },
    ],
    // title: "Pennywise - Smart Personal Finance Management",
  }),

  shellComponent: Layout,
});

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="motion-safe:scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-svh bg-beige-100 font-sans text-base font-normal antialiased">
        {children}
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
