import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Pennywise - Take Control of Your Money" },
    {
      name: "description",
      content:
        "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start managing your money smarter today.",
    },

    // Open Graph / Facebook
    { property: "og:title", content: "Pennywise - Take Control of Your Money" },
    {
      property: "og:description",
      content:
        "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
    },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Pennywise - Take Control of Your Money" },
    {
      name: "twitter:description",
      content:
        "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
    },
    { name: "twitter:image", content: "https://pennywise.app/twitter-image.png" },
    { name: "twitter:creator", content: "@pennywise" },

    // SEO
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export default function Page() {
  return (
    <>
      <h1>Pennywise</h1>
    </>
  );
}
