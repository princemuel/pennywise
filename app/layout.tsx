import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "temporal-polyfill/global";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-family-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pennywise - Smart Personal Finance Management",
  description:
    "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health. Free personal finance app with bank-level security.",
  keywords:
    "personal finance, personal finance software, budget tracker, budget planner, expense tracking, track expenses, savings goals, financial planning, money management, budget app, spending tracker, financial wellness",

  icons: ["favicon.svg"],
  openGraph: {
    type: "website",
    url: "https://pennywise.com",
    title: "Pennywise - Smart Personal Finance Management",
    description:
      "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
    siteName: "Pennywise",
    images: "https://pennywise.com/og.png",
  },
  twitter: {
    card: "summary_large_image",
    site: "@site",
    creator: "@pennywise",
    title: "Pennywise - Smart Personal Finance Management",
    description:
      "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
    images: "https://pennywise.com/og.png",
  },
  robots: "index, follow",
  appleWebApp: { capable: true, title: "Pennywise", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  // themeColor: [
  //   { media: "(prefers-color-scheme: dark)", color: "#000000" },
  //   { media: "(prefers-color-scheme: light)", color: "#ffffff" }
  // ],
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} motion-safe:scroll-smooth`}>
      <body className="relative min-h-svh bg-beige-100 font-sans text-base font-normal antialiased">
        {children}
      </body>
    </html>
  );
}
