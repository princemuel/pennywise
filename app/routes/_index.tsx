import { Main } from "@/components/main";

import { Fragment } from "react";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/_index";

const isPositive = (value = 0) => value > 0;

export const loader = async (_params: Route.LoaderArgs) => {
  type TImage = { default: string };
  const assets = import.meta.glob<TImage>(
    "../assets/images/*.{png,jpg,jpeg,webp,avif}",
    { eager: true },
  );

  const images = Object.fromEntries(
    Object.entries(assets).map(([path, module]) => {
      const filename =
        path
          .split("/")
          .pop()
          ?.replace(/\.(png|jpg|jpeg|avif|webp)$/, "") ?? "placeholder";
      return [filename, module.default];
    }),
  );

  const response = (await import("../content/database.json")).default;

  const data = {
    ...response,
    transactions: response.transactions.map((v) => {
      const filename =
        v.avatar
          .split("/")
          .pop()
          ?.replace(/\.(png|jpg|jpeg|avif|webp)$/, "") ?? "placeholder";
      return { ...v, avatar: images[filename] };
    }),
  };

  return data;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  console.table(data);

  return (
    <Main className="overflow-y-auto">
      <h1 id="headline">Overview</h1>
      <section>
        <dl>
          <dt>Current Balance</dt>
          <dd>${data.balance.current}</dd>
        </dl>
        <dl>
          <dt>Income</dt>
          <dd>${data.balance.income}</dd>
        </dl>
        <dl>
          <dt>Expenses</dt>
          <dd>${data.balance.expenses}</dd>
        </dl>
        <section aria-labelledby="pots">
          <h2 id="pots">Pots</h2> See Details Total Saved
          {data.pots.map((v, idx) => {
            return (
              <Fragment key={`${v.name}-${idx}`}>
                <article>
                  <p>{v.target}</p>
                  <p>{v.name}</p>
                  <p>{v.theme}</p>
                  <p>{v.total}</p>
                </article>
              </Fragment>
            );
          })}
        </section>

        {/* Add pots data */}
        <section aria-labelledby="budgets">
          <h2 id="budgets">Budgets</h2> See Details
          {data.budgets.map((v, idx) => {
            return (
              <Fragment key={`${v.category}-${idx}`}>
                <article>
                  <p>{v.maximum}</p>
                  <p>{v.theme}</p>
                  <p>{v.category}</p>
                </article>
              </Fragment>
            );
          })}
        </section>

        <section aria-labelledby="transactions">
          <h2 id="transactions">Transactions</h2> View All
          {data.transactions.map((v, idx) => {
            const date = new Date(v.date);
            return (
              <Fragment key={`${v.name}-${idx}`}>
                <Link to={"#"} className="">
                  <p>{v.category}</p>
                  <h4>{v.name}</h4>
                  <img
                    src={v.avatar}
                    alt={`${v.name}'s good looking mug`}
                    className="rounded-full"
                  />
                  <p data-positive={`${isPositive(v.amount)}`}>{v.amount}</p>
                  <time dateTime={date.toISOString()}>{date.toDateString()}</time>
                </Link>
              </Fragment>
            );
          })}
        </section>
        {/* Add transactions data */}

        <section aria-labelledby="bills">
          <h2 id="bills">Recurring Bills</h2> See Details
          {data.transactions
            .filter((v) => v.recurring)
            .map((v, idx) => {
              const date = new Date(v.date);
              return (
                <Fragment key={`${v.name}-${idx}`}>
                  <Link to={"#"} className="">
                    <p>{v.category}</p>
                    <h4>{v.name}</h4>
                    <img
                      src={v.avatar}
                      alt={`${v.name}'s good looking mug`}
                      className="rounded-full"
                    />
                    <p data-positive={`${isPositive(v.amount)}`}>{v.amount}</p>
                    <time dateTime={date.toISOString()}>{date.toDateString()}</time>
                  </Link>
                </Fragment>
              );
            })}
        </section>

        {/* Add recurring bills data */}
      </section>
    </Main>
  );
}
