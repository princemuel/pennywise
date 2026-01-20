import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
import { tw } from "@/helpers/tailwind";
import routes from "@/lib/content/routes";
import { Form, Link, NavLink, Outlet, useRouteLoaderData } from "react-router";

import type { loader } from "@/root";

export default function Layout() {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const isSidebarExpanded = rootData?.showNav ?? true;

  return (
    <section
      className={tw([
        "@container grid h-svh w-full max-lg:grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr]",
      ])}
    >
      <aside
        className={tw([
          "bg-grey-900 px-4 max-lg:order-2 max-lg:rounded-t-2xl max-lg:pt-2 sm:px-10",
          "lg:flex lg:flex-col lg:overflow-y-auto lg:rounded-r-2xl lg:p-0 lg:py-12",
          "lg:transition-[width,padding] lg:duration-300 lg:ease-in-out",
          isSidebarExpanded ? "lg:w-64 lg:pr-6" : "lg:w-20 lg:pr-0",
        ])}
      >
        <section className="min-h-full flex-col gap-16 lg:flex">
          <Link
            to="/"
            className="hidden items-center justify-center text-white transition-all duration-300 lg:flex"
          >
            {isSidebarExpanded ? (
              <IconLogo className="transition-transform duration-300" />
            ) : (
              <IconLogoX className="transition-transform duration-300" />
            )}
          </Link>

          {/* Navigation */}
          <nav
            aria-label="Main"
            className="flex items-center justify-between capitalize lg:flex-col lg:items-stretch"
          >
            {routes.map((r) => (
              <NavLink
                to={r.href}
                key={r.text}
                className={tw([
                  "p-2 text-sm font-bold lg:p-4 lg:text-base",
                  "grid flex-1 items-center justify-items-center gap-2",
                  "md:grid-rows-2 lg:grid-rows-1 lg:gap-4",
                  isSidebarExpanded ? "lg:grid-cols-[auto_1fr]" : "lg:grid-cols-1",
                  "max-lg:rounded-t-xl lg:rounded-r-xl",
                  "bg-transparent active:bg-beige-100 aria-[current=page]:bg-beige-100",
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100 aria-[current=page]:text-brand-400",
                ])}
              >
                <r.Icon className="text-2xl" />
                <span
                  className={tw([
                    "hidden aria-[current=page]:text-grey-900 md:inline-flex",
                    "transition-[opacity,width] transition-discrete duration-300",
                    !isSidebarExpanded && "lg:hidden lg:w-0 lg:overflow-hidden lg:opacity-0",
                  ])}
                >
                  {r.text}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Minimize/Expand Button */}
          <Form method="post" className="mt-auto hidden lg:flex">
            <input type="hidden" name="showNav" value={`${!isSidebarExpanded}`} />
            <button
              type="submit"
              aria-controls="primary-nav"
              aria-expanded={isSidebarExpanded}
              aria-label={isSidebarExpanded ? "Minimize menu" : "Expand menu"}
              className={tw([
                "p-4 text-base font-bold",
                "flex flex-1 items-center gap-4",
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                "lg:grid lg:grid-cols-[auto_1fr] lg:items-center",
              ])}
            >
              <IconArrowFatLinesLeft
                className={tw([
                  "text-2xl transition-transform duration-300 lg:justify-self-center",
                  !isSidebarExpanded && "rotate-180",
                ])}
              />
              <span
                className={tw([
                  "transition-[opacity,width] duration-300",
                  !isSidebarExpanded && "lg:w-0 lg:overflow-hidden lg:opacity-0",
                ])}
              >
                Minimize Menu
              </span>
            </button>
          </Form>
        </section>
      </aside>

      <main aria-labelledby="a11ty-headline" className="overflow-y-auto max-lg:order-1">
        <Outlet />
      </main>
    </section>
  );
}
