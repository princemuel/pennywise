import db from "@/lib/content/db";

import type { Route } from "./+types/_dash.transactions._index";

export async function loader(_: Route.LoaderArgs) {
  return { data: db.budgets, error: null };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  let { data: _budgets } = loaderData;
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Budgets
        </h1>
      </header>
    </>
  );
}
