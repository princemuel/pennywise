import { Link, NavLink, Outlet } from "react-router";

import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
import { tw } from "@/helpers/tailwind";
import routes from "@/lib/content/routes";

import type { Route } from "./+types/_dash";

export default function Layout({ loaderData }: Route.ComponentProps) {
  // let [state, setState] = useState(loaderData.sideBar)
  //   async function toggleSidebar() {

  //   setState(prev => prev === "compact" ? "default" : "compact")

  //   // await setSidebarCookieClient(state);
  // }
  let state = "default";
  return (
    <div className="grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-1">
      <aside
        id="sidebar"
        data-size={state}
        aria-label="Sidebar"
        className={tw([
          "order-2 rounded-t-2xl bg-grey-900 px-4 pt-2 sm:px-10 lg:order-1",
          "lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12",
          state !== "compact"
            ? "lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6"
            : "lg:w-22 lg:grid-cols-[auto] lg:pr-2",
        ])}
      >
        <div className="flex min-h-full flex-col gap-16">
          <Link
            to="/"
            className="group hidden items-center py-4 text-white not-in-mini:px-8 in-mini:justify-center lg:flex"
            viewTransition
          >
            <span className="sr-only">Home</span>
            {state !== "compact" ? <IconLogo /> : <IconLogoX />}
          </Link>

          <nav
            aria-label="Main"
            className="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
            data-sveltekit-preload-data="tap"
          >
            {routes.map((route) => (
              <NavLink
                key={route.text}
                to={route.href}
                className={tw([
                  "flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-bold lg:text-base",
                  "lg:flex-row lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
                  "rounded-t-xl border-brand-400 bg-transparent lg:rounded-t-none lg:rounded-r-xl",
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                  "data-active:bg-beige-100 data-active:text-brand-400",
                  "max-lg:data-active:border-b-4 lg:data-active:border-l-4",
                ])}
                viewTransition
              >
                <route.Icon className="text-2xl" aria-hidden="true" />
                <span className="hidden flex-1 sm:not-in-mini:inline-block">{route.text}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden lg:block">
            <button
              type="button"
              aria-controls="sidebar"
              aria-expanded={state !== "compact"}
              // onclick={toggleSidebar}
              data-size={state}
              className={tw([
                "flex w-full items-center justify-center p-2 text-xs font-bold capitalize lg:text-base",
                "lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
              ])}
            >
              <IconArrowFatLinesLeft className="text-2xl in-mini:rotate-180" aria-hidden="true" />
              <span className="hidden flex-1 sm:not-in-mini:inline-block">minimize menu</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        aria-labelledby="a11ty-headline"
        className="@container order-1 overflow-y-auto px-[1cqmax] py-8 lg:order-2 lg:px-8"
      >
        <div className="mx-auto flex w-full flex-col gap-8 3xl:max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
