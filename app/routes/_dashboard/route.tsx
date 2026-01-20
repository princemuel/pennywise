import { IconLogo } from "@/assets/media/icons";
import { tw } from "@/helpers/tailwind";
import routes from "@/lib/content/routes";
import { Link, NavLink, Outlet, useRouteLoaderData } from "react-router";

export default function Layout() {
  const data = useRouteLoaderData("root");

  return (
    <section className={tw(["@container grid h-svh w-full grid-rows-[1fr_auto]"])}>
      <main aria-labelledby="a11ty-headline" className="">
        <Outlet />
      </main>

      <aside
        data-visible={Boolean(0)}
        className="bg-grey-900 px-4 max-lg:rounded-t-2xl max-lg:pt-2 sm:px-10 lg:rounded-r-2xl lg:p-0 lg:pr-6"
      >
        <section className="flex-col gap-16 lg:flex">
          <Link to="/" className="hidden items-center text-white lg:flex">
            <IconLogo className="" />
          </Link>

          <nav
            aria-label="Main"
            className="flex items-center justify-around capitalize lg:flex-col lg:items-stretch"
          >
            {routes.map((r) => (
              <NavLink
                to={r.href}
                key={r.text}
                className={tw([
                  "p-2 text-base font-bold lg:p-4",
                  "flex flex-1 flex-col items-center gap-2 lg:flex-row lg:gap-4",
                  "max-lg:rounded-t-xl lg:rounded-r-xl",
                  "bg-transparent active:bg-beige-100 aria-[current=page]:bg-beige-100",
                  "text-grey-300 hover:text-white aria-[current=page]:text-brand-400",
                ])}
              >
                <r.Icon className="text-2xl" />
                <span className="sr-only aria-[current=page]:text-grey-900 md:not-sr-only">
                  {r.text}
                </span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            aria-expanded="false"
            aria-controls="id_about_menu"
            aria-label="More About pages"
          ></button>
        </section>
      </aside>
    </section>
  );
}
