import { MenuToggle } from "./menu-toggle";

import { IconLogo, IconLogoX } from "@/assets/icons";
import { routes } from "@/content/routes";

import { Form, Link, NavLink, useLoaderData } from "react-router";

import { tw } from "@/helpers/tailwind";
import type { loader } from "@/root";

export const Sidebar = () => {
  const data = useLoaderData<typeof loader>();

  const { sidebar_state } = data.config;
  return (
    <aside className="flex flex-col gap-8 rounded-r-2xl bg-black py-12">
      <figure className="px-8">
        <Link to="/" className="group flex items-center text-white">
          <IconLogoX
            data-ui={sidebar_state}
            className="peer hidden data-compact:block"
          />
          <IconLogo className="block peer-data-compact:hidden" />
        </Link>
      </figure>

      <nav aria-label="Primary" className="mt-16 mr-8 flex flex-col gap-4">
        {routes.map((route) => (
          <NavLink
            key={route.text}
            to={route.href}
            className={tw([
              "group grid grid-cols-[2ch_1fr] gap-4 py-4 pl-8 text-gray-300",
              "rounded-r-lg aria-[current=page]:bg-white",
            ])}
          >
            <route.Icon className="text-xl group-aria-[current=page]:text-accent-400" />
            <span
              data-ui={sidebar_state}
              className={tw([
                "overflow-hidden whitespace-nowrap font-bold text-base capitalize",
                "transition-opacitydelay-300 duration-300 ease-out",
                "data-compact:max-w-0 data-compact:opacity-0",
                "group-aria-[current]:text-grey-900",
              ])}
            >
              {route.text}
            </span>
          </NavLink>
        ))}
      </nav>

      <Form method="post" className="mt-auto mr-8">
        <MenuToggle />
      </Form>
    </aside>
  );
};
