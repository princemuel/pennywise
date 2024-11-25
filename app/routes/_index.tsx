import { Main } from "@/components/main";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";

export const loader = async (params: Route.LoaderArgs) => {
  return params;
};

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <h1 id="headline" className="text-brand-500 text-xl">
        Overview
      </h1>
    </Main>
  );
}
