import type { Route } from "./+types/pots";

import { createHash } from "node:crypto";

export async function loader() {
  const data = await import("@/content/database.json");

  const result = data.pots.map((pot) =>
    Object.assign(pot, {
      id: createHash("sha1").update(pot.name).digest("hex").slice(0, 6),
      percent: (pot.total / pot.target) * 100,
    }),
  );

  return result;
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const pots = loaderData;
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Pots
        </h1>
      </header>

      <section className="grid gap-6 @md/main:grid-cols-[repeat(auto-fit,minmax(clamp(24rem,100%,28rem),1fr))]">
        {pots.map((pot) => (
          <article
            key={pot.id}
            className="flex flex-col gap-8 rounded-xl bg-white p-6"
            style={{ "--bg-color": pot.theme }}
          >
            <header className="flex items-center gap-4">
              <span className="rounded-full bg-(--bg-color) p-2" />

              <h4 className="text-xl font-semibold text-grey-900">{pot.name}</h4>

              <div className="relative ml-auto">
                <button
                  type="button"
                  popoverTarget={pot.id}
                  popoverTargetAction="toggle"
                  className="anchor"
                  style={{ anchorName: `--anchor-${pot.id}` }}
                >
                  ...
                </button>

                <div
                  id={pot.id}
                  popover=""
                  className="absolute inset-auto top-[anchor(top)] right-[anchor(right)] m-0 mt-8 rounded-lg bg-white shadow-sm transition-all transition-discrete duration-500 open:flex starting:open:opacity-0"
                  style={{ positionAnchor: `--anchor-${pot.id}` }}
                >
                  <section className="flex flex-col divide-y divide-grey-100 px-6 *:py-4">
                    <button type="button" className="text-sm text-grey-900">
                      Edit Pot
                    </button>
                    <button type="button" className="text-sm text-brand-200">
                      Delete Pot
                    </button>
                  </section>
                </div>
              </div>
            </header>

            <div className="flex flex-col gap-4">
              <dl className="flex items-center justify-between">
                <dt className="text-sm text-grey-500">Total Saved</dt>
                <dd className="text-3xl font-bold text-grey-900">${pot.total.toFixed(2)}</dd>
              </dl>

              <div
                role="progressbar"
                aria-valuenow={Math.min(100, Number(pot.percent.toFixed(2)))}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 overflow-hidden rounded-full bg-beige-100"
              >
                <div
                  className="h-full w-(--width) rounded-full bg-(--bg-color)"
                  style={{ "--width": `${Math.min(100, Number(pot.percent.toFixed(2)))}%` }}
                ></div>
              </div>

              <dl className="flex items-center justify-between">
                <dd className="text-xs font-bold text-grey-500">{pot.percent.toFixed(2)}%</dd>
                <dt className="text-xs text-grey-500">Target of ${pot.target.toLocaleString()}</dt>
              </dl>
            </div>

            <section className="flex items-center justify-between gap-4">
              <button
                type="button"
                className="flex-1 rounded-lg bg-beige-100 p-4 text-sm font-bold text-grey-900"
              >
                + Add Money
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-beige-100 p-4 text-sm font-bold text-grey-900"
              >
                Withdraw
              </button>
            </section>
          </article>
        ))}
      </section>
    </>
  );
}
