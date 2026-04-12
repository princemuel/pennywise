import db from "@/lib/content/db";

import type { Route } from "./+types/_dash.transactions._index";

export async function loader(_: Route.LoaderArgs) {
  const txns = db.transactions.filter((txn) => txn.recurring && txn.category === "Bills");
  return { data: txns, error: null };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  let { data: _bills } = loaderData;
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Recurring Bills
        </h1>
      </header>
    </>
  );
}
