/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { tw } from "@/helpers/tailwind";
import routes from "@/lib/routes";
import { toggleSidebar } from "@/server/sidebar";

import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";

export const Route = createFileRoute("/(dashboard)/__layout")({
  component: Layout,
});

function Layout() {
  const mini = false;
  const expand = !mini;
  const uiState = expand ? "expand" : "compact";
  return (
    <section className="grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-1">
      <aside
        id="sidebar"
        data-ui={`sidebar ${uiState}`}
        className={tw([
          "order-2 bg-grey-900 lg:order-1",
          "rounded-t-2xl px-4 pt-2 sm:px-10",
          "lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12",
          expand
            ? "lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6"
            : "lg:w-22 lg:grid-cols-[auto] lg:pr-2",
        ])}
      >
        <div className="flex min-h-full flex-col gap-16">
          <Link
            to="/"
            className="group hidden items-center py-4 text-white not-in-mini:px-8 in-mini:justify-center lg:flex"
          >
            <span className="sr-only">Home</span>
            {expand ? <IconLogo /> : <IconLogoX />}
          </Link>

          <nav
            aria-label="Main"
            className="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
          >
            {routes.map((route) => (
              <Link
                key={route.text}
                to={route.href}
                viewTransition
                className={tw([
                  "flex-1 p-2 text-xs font-bold lg:text-base",
                  "flex flex-col items-center justify-center gap-1",
                  "lg:flex-row lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
                  "rounded-t-xl border-brand-400 bg-transparent lg:rounded-t-none lg:rounded-r-xl",
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                  "aria-[current=page]:bg-beige-100 aria-[current=page]:text-brand-400",
                  "max-lg:aria-[current=page]:border-b-4 lg:aria-[current=page]:border-l-4",
                ])}
              >
                <route.Icon className="text-2xl" aria-hidden="true" />
                <span className="hidden flex-1 sm:not-in-mini:inline-block">{route.text}</span>
              </Link>
            ))}
          </nav>

          {/* NAVIGATION */}
          <Form action={toggleSidebar} className="mt-auto hidden lg:block">
            <button
              type="submit"
              name="mini"
              aria-controls="sidebar"
              aria-expanded={expand}
              aria-label={`${uiState} navigation`}
              value={`${!mini}`}
              className={tw([
                "flex w-full items-center justify-center p-2",
                "lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
                "text-xs font-bold capitalize lg:text-base",
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
              ])}
            >
              <IconArrowFatLinesLeft className="text-2xl in-mini:rotate-180" aria-hidden="true" />
              <span className="hidden flex-1 sm:not-in-mini:inline-block">minimize menu</span>
            </button>
          </Form>
        </div>
      </aside>

      <main
        aria-labelledby="a11ty-headline"
        className="@container/main order-1 flex flex-col gap-10 overflow-y-auto px-6 py-8 lg:order-2"
      >
        <Outlet />
      </main>
    </section>
  );
}
