import { Link } from "react-router";

import { IconCaretRight, IconJarFill } from "@/assets/media/icons";
import db from "@/lib/content/db";

import type { Route } from "./+types/_dash._index";

export function meta() {
  return [
    { title: "Pennywise - Smart Personal Finance Management" },
    {
      name: "description",
      content:
        "Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health.",
    },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  return { data: db, error: null };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  let { data } = loaderData;

  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Overview
        </h1>
      </header>
      <section className="grid auto-cols-fr gap-8 sm:grid-cols-3">
        <article className="flex flex-col gap-3 rounded-xl bg-grey-900 p-6 xl:p-8">
          <h4 className="text-sm text-white">Current Balance</h4>
          <p className="text-3xl font-bold text-white">${data.balance.current.toLocaleString()}</p>
        </article>
        <article className="md flex flex-col gap-3 rounded-xl bg-white p-6 xl:p-8">
          <h4 className="text-sm text-grey-500">Income</h4>
          <p className="text-3xl font-bold text-grey-900">
            ${data.balance.income.toLocaleString()}
          </p>
        </article>
        <article className="flex flex-col gap-3 rounded-xl bg-white p-6 xl:p-8">
          <h4 className="text-sm text-grey-500">Expenses</h4>
          <p className="text-3xl font-bold text-grey-900">
            ${data.balance.expenses.toLocaleString()}
          </p>
        </article>
      </section>
      <section className="@container grid auto-rows-auto grid-cols-5 gap-8">
        <article
          aria-labelledby="pots"
          className="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 xl:p-8 @4xl:col-span-3"
        >
          <header className="flex items-center justify-between">
            <h3 id="pots" className="text-xl font-bold text-grey-900">
              Pots
            </h3>
            <Link
              to="/pots"
              className="flex items-center gap-4 text-sm text-grey-500"
              viewTransition
            >
              <span>See Details</span>
              <IconCaretRight />
            </Link>
          </header>

          <div className="col-span-full grid gap-6 @2xl:grid-cols-5">
            <div className="col-span-full flex items-center gap-6 rounded-xl bg-beige-100 p-6 xl:p-8 @2xl:col-span-2">
              <IconJarFill className="text-brand-400" />
              <div className="flex flex-col gap-3">
                <h5 className="text-sm text-grey-500">Total Saved</h5>
                <p className="text-3xl font-bold text-grey-900">
                  ${data.pots.reduce((total, item) => total + item.total, 0)}
                </p>
              </div>
            </div>

            <div className="col-span-full grid auto-cols-fr grid-cols-2 gap-4 @2xl:col-span-3">
              {data.pots.slice(0, 4).map((pot) => (
                <div
                  key={pot.id}
                  className="flex items-center gap-4"
                  style={{ "--color": pot.theme }}
                >
                  <div className="h-full w-1 rounded-full bg-(--color)"></div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h6 className="text-xs text-grey-500">{pot.name}</h6>
                    <p className="text-sm font-bold text-grey-900">${pot.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article
          aria-labelledby="budgets"
          className="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 xl:p-8 @4xl:col-span-2 @4xl:row-span-3"
        >
          <header className="flex items-center justify-between">
            <h3 id="budgets" className="text-xl font-bold text-grey-900">
              Budgets
            </h3>
            <Link
              to="/budgets"
              className="flex items-center gap-4 text-sm text-grey-500"
              viewTransition
            >
              <span>See Details</span>
              <IconCaretRight />
            </Link>
          </header>
        </article>

        <article
          aria-labelledby="transactions"
          className="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 xl:p-8 @4xl:col-span-3 @4xl:row-span-4"
        >
          <header className="flex items-center justify-between">
            <h3 id="transactions" className="text-xl font-bold text-grey-900">
              Transactions
            </h3>
            <Link
              to="/transactions"
              className="flex items-center gap-4 text-sm text-grey-500"
              viewTransition
            >
              <span>View All</span>
              <IconCaretRight />
            </Link>
          </header>

          <div className="flex flex-col divide-y divide-grey-100">
            {data.transactions.slice(0, 6).map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 py-5">
                <img src={txn.avatar} alt={txn.name} className="size-12 rounded-full" />
                <h5 className="text-sm font-bold text-grey-900">{txn.name}</h5>
                <div className="ml-auto flex flex-col">
                  <output className="text-right text-sm font-bold text-grey-900">
                    {txn.amount.toLocaleString()}
                  </output>
                  <time dateTime={txn.date} className="text-xs text-grey-500">
                    {new Date(txn.date).toDateString()}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          aria-labelledby="bills"
          className="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 xl:p-8 @4xl:col-span-2 @4xl:row-span-2"
        >
          <header className="flex items-center justify-between">
            <h3 id="bills" className="text-xl font-bold text-grey-900">
              Recurring Bills
            </h3>
            <Link
              to="/bills"
              className="flex items-center gap-4 text-sm text-grey-500"
              viewTransition
            >
              <span>See Details</span>
              <IconCaretRight />
            </Link>
          </header>
        </article>
      </section>
    </>
  );
}
