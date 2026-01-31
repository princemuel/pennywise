import Link from "next/link";

import { IconEllipsis } from "@/assets/media/icons";

export default async function Page() {
  const data = (await import("@/lib/content/data")).default;
  const pots = data.pots;

  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Pots
        </h1>
      </header>

      <section className="grid gap-8 @md/main:grid-cols-[repeat(auto-fit,minmax(clamp(24rem,100%,28rem),1fr))]">
        {(pots ?? []).map((pot) => (
          <article
            key={pot.id}
            className="flex flex-col gap-8 rounded-xl bg-white p-6"
            style={{ "--bg-color": pot.theme, anchorScope: "--anchor-pot" }}
          >
            <header className="flex items-center gap-4">
              <span className="rounded-full bg-(--bg-color) p-2" />

              <h4 className="text-xl font-semibold text-grey-900">{pot.name}</h4>

              <div className="relative ml-auto">
                <button
                  type="button"
                  popoverTarget={`pot-actions-${pot.id}`}
                  popoverTargetAction="toggle"
                  aria-haspopup="menu"
                  aria-label="Open pot actions"
                  aria-controls={pot.id}
                  className="rounded p-2 text-grey-300 hover:text-grey-500 focus-visible:outline-2"
                  style={{ anchorName: "--anchor-pot" }}
                >
                  <span className="sr-only">Open pot actions menu</span>
                  <IconEllipsis className="text-xl" />
                </button>

                <div
                  id={`pot-actions-${pot.id}`}
                  popover="auto"
                  className="absolute inset-auto top-[anchor(top)] right-[anchor(right)] m-0 mt-6 rounded-lg bg-white opacity-0 shadow-sm transition transition-discrete duration-1000 ease-in open:grid open:opacity-100 starting:open:grid starting:open:opacity-0"
                  style={{ positionAnchor: "--anchor-pot" }}
                >
                  <menu className="flex flex-col divide-y divide-grey-100 px-6">
                    <li className="py-2">
                      <Link
                        href={`/pots/${pot.id}/edit`}
                        popoverTarget={`pot-actions-${pot.id}`}
                        popoverTargetAction="hide"
                        aria-haspopup="dialog"
                        aria-controls={`edit-pot-modal-${pot.id}`}
                        className="text-sm text-grey-900 focus-visible:outline-2"
                      >
                        Edit Pot
                      </Link>
                    </li>
                    <li className="py-2">
                      <Link
                        href={`/pots/${pot.id}/destroy`}
                        popoverTarget={`pot-actions-${pot.id}`}
                        popoverTargetAction="hide"
                        aria-haspopup="dialog"
                        aria-controls={`delete-pot-modal-${pot.id}`}
                        className="text-sm text-brand-200 focus-visible:outline-2"
                      >
                        Delete Pot
                      </Link>
                    </li>
                  </menu>
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
