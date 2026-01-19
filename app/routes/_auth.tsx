import { IconLogo } from "@/assets/media/icons";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <main
      aria-labelledby="a11ty-headline"
      className="@container grid h-svh w-full grid-rows-[auto_1fr] flex-col lg:flex-row"
    >
      <header className="flex items-center justify-center rounded-b-xl bg-grey-900 py-6 text-white lg:hidden">
        <IconLogo />
      </header>

      <section className="self-center px-[6cqw]">
        <Outlet />
      </section>
    </main>
  );
}
