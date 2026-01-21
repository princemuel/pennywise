import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
import { tw } from "@/helpers/tailwind";
import routes from "@/lib/content/routes";
import { Form, Link, NavLink, Outlet, useRouteLoaderData } from "react-router";

import type { loader } from "@/root";

export default function Layout() {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const isSidebarExpanded = rootData?.showNav ?? true;

  return (
    <section className="@container grid h-svh w-full max-lg:grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr]">
      <aside
        data-expanded={isSidebarExpanded}
        className={tw([
          // Base styles
          "bg-grey-900 lg:overflow-y-auto",
          // Mobile styles
          "order-2 rounded-t-2xl px-4 pt-2 sm:px-10",
          // Desktop styles
          "lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12",
          // Width animation
          "lg:transition-[width,padding] lg:duration-500 lg:ease-in-out",
          isSidebarExpanded ? "lg:w-75 lg:pr-6" : "lg:w-22 lg:pr-0",
        ])}
      >
        <div className="flex min-h-full flex-col gap-16">
          <Link
            to="/"
            className={tw([
              "hidden items-center text-white lg:flex",
              isSidebarExpanded ? "justify-start" : "justify-center",
            ])}
          >
            {isSidebarExpanded ? <IconLogo /> : <IconLogoX />}
          </Link>

          <nav
            aria-label="Main"
            className="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
          >
            {routes.map((r) => (
              <NavLink
                to={r.href}
                key={r.text}
                className={tw([
                  // Layout
                  "grid flex-1 items-center gap-2 p-2",
                  "md:grid-rows-2 lg:grid-rows-1 lg:gap-4 lg:p-4",
                  isSidebarExpanded ? "lg:grid-cols-[auto_1fr]" : "lg:grid-cols-[auto_0fr]",
                  // Alignment
                  "items-center justify-items-center lg:justify-items-start",
                  // Transitions
                  "lg:transition-[grid-template-columns] lg:duration-500 lg:ease-in-out",
                  // Appearance
                  "rounded-t-xl bg-transparent lg:rounded-t-none lg:rounded-r-xl",
                  // States
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                  "active:bg-beige-100 aria-[current=page]:bg-beige-100 aria-[current=page]:text-brand-400",
                  // Typography
                  "text-sm font-bold lg:text-base",
                ])}
              >
                <r.Icon className={tw(["text-2xl", !isSidebarExpanded && "justify-self-center"])} />
                <span
                  className={tw([
                    // Visibility
                    "hidden",
                    !isSidebarExpanded ? "md:hidden" : "md:block",
                    // Text color for active state
                    "aria-[current=page]:text-grey-900",
                    // Animation - opacity fades while grid collapses
                    "opacity-100 transition-[display] transition-discrete duration-300",
                  ])}
                >
                  {r.text}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Collapse/Expand Button */}
          <Form method="post" className="mt-auto hidden lg:block">
            <input type="hidden" name="showNav" value={`${!isSidebarExpanded}`} />
            <button
              type="submit"
              aria-controls="primary-nav"
              aria-expanded={isSidebarExpanded}
              aria-label={isSidebarExpanded ? "Minimize menu" : "Expand menu"}
              className={tw([
                // Layout
                "grid w-full items-center gap-4 p-4",
                isSidebarExpanded ? "lg:grid-cols-[auto_1fr]" : "lg:grid-cols-[auto_0fr]",
                // Transitions
                "transition-[grid-template-columns] duration-500 ease-in-out",
                // Typography
                "text-base font-bold",
                // States
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
              ])}
            >
              <IconArrowFatLinesLeft
                className={tw([
                  "text-2xl transition-transform duration-300",
                  !isSidebarExpanded && "rotate-180 justify-self-center",
                ])}
              />
              <span
                className={tw([
                  "overflow-hidden transition-[opacity,display] duration-300",
                  !isSidebarExpanded ? "md:hidden" : "md:block",
                ])}
              >
                Minimize Menu
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
