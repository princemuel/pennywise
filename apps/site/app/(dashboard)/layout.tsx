import Form from "next/form";
import Link from "next/link";

import { toggleSidebar } from "@/actions/sidebar";
import { tw } from "@/helpers/tailwind";
import { getUserPrefs } from "@/lib/cookies";

import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
import NavLink from "@/components/navlink";
import routes from "@/lib/content/routes";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { minimize } = await getUserPrefs();
  const expanded = !minimize;
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
          expanded
            ? "lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6"
            : "lg:w-22 lg:grid-cols-[auto] lg:pr-2",
        ])}
      >
        <div className="flex min-h-full flex-col gap-16">
          <Link
            href="/"
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
                href={route.href}
                className={tw([
                  "flex-1 p-2 text-xs font-bold lg:text-base",
                  "flex flex-col items-center justify-center gap-1",
                  "lg:flex-row lg:gap-6 lg:p-4 lg:not-in-minimized:px-8",
                  "rounded-t-xl border-brand-400 bg-transparent lg:rounded-t-none lg:rounded-r-xl",
                  "text-grey-300 hover:text-grey-100 focus:text-grey-100",
                  "aria-[current=page]:bg-beige-100 aria-[current=page]:text-brand-400",
                  "max-lg:aria-[current=page]:border-b-4 lg:aria-[current=page]:border-l-4",
                ])}
              >
                <route.Icon className="text-2xl" aria-hidden="true" />
                <span className="hidden flex-1 sm:not-in-minimized:inline-block">{route.text}</span>
              </NavLink>
            ))}
          </nav>

          {/* NAVIGATION */}
          <Form action={toggleSidebar} className="mt-auto hidden lg:block">
            <button
              type="submit"
              name="minimize"
              aria-controls="sidebar"
              aria-expanded={expanded}
              aria-label={`${uiState} navigation`}
              value={`${!minimize}`}
              className={tw([
                "flex w-full items-center justify-center p-2",
                "lg:gap-6 lg:p-4 lg:not-in-minimized:px-8",
                "text-xs font-bold capitalize lg:text-base",
                "text-grey-300 hover:text-grey-100 focus:text-grey-100",
              ])}
            >
              <IconArrowFatLinesLeft
                className="text-2xl in-minimized:rotate-180"
                aria-hidden="true"
              />
              <span className="hidden flex-1 sm:not-in-minimized:inline-block">minimize menu</span>
            </button>
          </Form>
        </div>
      </aside>

      <main
        aria-labelledby="a11ty-headline"
        className="@container/main order-1 flex flex-col gap-10 overflow-y-auto px-6 py-8 lg:order-2"
      >
        {children}
      </main>
    </section>
  );
}
