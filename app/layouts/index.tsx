import { tw } from "@/helpers/tailwind";
import { Sidebar } from "@/layouts/sidebar";

import type { loader } from "@/root";
import { useLoaderData } from "react-router";

export const RootLayout = ({ children }: React.ComponentProps<"div">) => {
  const data = useLoaderData<typeof loader>();

  const { sidebar_state } = data.config;

  console.log(sidebar_state);

  return (
    <div
      data-ui={sidebar_state}
      className={tw([
        "relative min-h-screen supports-[min-height:100svh]:min-h-svh",
        "grid grid-cols-1",
        "lg:grid-cols-[18rem_1fr] lg:data-compact:grid-cols-[6rem_1fr]",
        "transition-[grid-template-columns] duration-300 ease-in-out",
      ])}
    >
      <Sidebar />
      {children}
    </div>
  );
};
