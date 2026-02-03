import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pennywise - Take Control of Your Money",
  description:
    "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
  keywords:
    "personal finance, personal finance software, budget tracker, budget planner, expense tracking, track expenses, savings goals, financial planning, money management, budget app, spending tracker, financial wellness",

  openGraph: {
    type: "website",
    url: "https://pennywise.com",
    title: "Pennywise - Take Control of Your Money",
    description:
      "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
    siteName: "Pennywise",
    images: "https://pennywise.com/og.png",
  },
  twitter: {
    card: "summary_large_image",
    site: "@site",
    creator: "@pennywise",
    title: "Pennywise - Take Control of Your Money",
    description:
      "Pennywise helps you track spending, stick to budgets, and reach savings goals faster. Beautiful insights, powerful features, bank-level security. Start your journey to financial wellness today.",
    images: "https://pennywise.com/og.png",
  },
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Overview
        </h1>
      </header>
    </>
  );
}
