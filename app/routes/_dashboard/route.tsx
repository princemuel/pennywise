import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
import { Form, Link, NavLink, Outlet, useRouteLoaderData } from "react-router";

import { tw } from "@/helpers/tailwind";
import routes from "@/lib/content/routes";
import type { loader } from "@/root";

export default function Layout() {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const expanded = rootData?.minimize ?? true;
  const uiState = expanded ? "expanded" : "collapsed";

  return (
    <section className="grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-1">
      <aside
        id="sidebar"
        data-ui={`sidebar ${uiState}`}
        className={tw([
          "order-2 bg-grey-900 lg:order-1",
          "rounded-t-2xl px-4 pt-2 sm:px-10",
          "lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12",
          "transition-[width,padding,display,grid-template-columns] transition-discrete duration-300",
          expanded
            ? "lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6"
            : "lg:w-22 lg:grid-cols-[auto] lg:pr-2",
        ])}
      >
        <div className="flex min-h-full flex-col gap-16">
          <Link
            to="/"
            className="group hidden items-center py-4 text-white not-in-minimized:px-8 in-minimized:justify-center lg:flex"
          >
            <span className="sr-only">Home</span>
            {expanded ? <IconLogo /> : <IconLogoX />}
          </Link>

          <nav
            aria-label="Main"
            className="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
          >
            {routes.map((route) => (
              <NavLink
                key={route.text}
                to={route.href}
                className={tw([
                  "flex-1 p-2 text-xs font-bold lg:text-base",
                  "flex flex-col items-center justify-center gap-1",
                  "lg:flex-row lg:gap-6 lg:p-4 lg:not-in-minimized:px-8",
                  "rounded-t-xl border-brand-400 bg-transparent lg:rounded-t-none lg:rounded-r-xl",
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                  "aria-[current=page]:bg-beige-100 aria-[current=page]:text-brand-400",
                  "max-lg:aria-[current=page]:border-b-4 lg:aria-[current=page]:border-l-4",
                  "transition-[width,padding,display,grid-template-columns] transition-discrete duration-300",
                ])}
              >
                <route.Icon className="text-2xl" aria-hidden="true" />
                <span className="hidden flex-1 sm:not-in-minimized:inline-block">{route.text}</span>
              </NavLink>
            ))}
          </nav>

          {/* NAVIGATION */}
          <Form method="post" className="mt-auto hidden lg:block">
            <button
              type="submit"
              name="minimize"
              aria-controls="sidebar"
              aria-expanded={expanded}
              aria-label={`${uiState} navigation`}
              value={`${!expanded}`}
              className={tw([
                "grid w-full items-center p-2",
                "p-4 lg:justify-items-center lg:gap-6 lg:not-in-minimized:px-8",
                "lg:not-in-minimized:grid-cols-[1rem_1fr] lg:not-in-minimized:justify-items-start",
                "text-xs font-bold capitalize lg:text-base",
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                "transition-[width,padding,display,grid-template-columns] transition-discrete duration-300",
              ])}
            >
              <IconArrowFatLinesLeft
                className="text-2xl transition-transform duration-300 in-minimized:rotate-180"
                aria-hidden="true"
              />
              <span
                className={tw([
                  "hidden flex-1 sm:not-in-minimized:inline-block",
                  "transition-[width,padding,display,grid-template-columns] transition-discrete duration-300",
                ])}
              >
                minimize menu
              </span>
            </button>
          </Form>
        </div>
      </aside>

      <main aria-labelledby="a11ty-headline" className="order-1 overflow-y-auto lg:order-2">
        <Outlet />
      </main>
    </section>
  );
}
