import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/")({
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
      },
      {
        name: "keywords",
        content:
          "personal finance, personal finance software, budget tracker, budget planner, expense tracking, track expenses, savings goals, financial planning, money management, budget app, spending tracker, financial wellness",
      },
      { name: "robots", content: "noindex, nofollow" },

      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pennywise.com" },
      { property: "og:title", content: "Pennywise - Take Control of Your Money" },
      {
        property: "og:description",
        content:
          "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
      },
      { property: "og:site_name", content: "Pennywise" },
      { property: "og:image", content: "https://pennywise.com/og.png" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@site" },
      { name: "twitter:creator", content: "@pennywise" },
      { name: "twitter:title", content: "Pennywise - Take Control of Your Money" },
      {
        name: "twitter:description",
        content:
          "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
      },
      { name: "twitter:image", content: "https://pennywise.com/og.png" },
    ],

    // title: "Pennywise - Take Control of Your Money",
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Overview
        </h1>
      </header>
      <div className="p-8">
        <p>Dashboard content coming soon...</p>
      </div>
    </>
  );
}
