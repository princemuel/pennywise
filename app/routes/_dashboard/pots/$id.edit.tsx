import { data, useParams } from "react-router";
import type { Route } from "./+types/$id.delete";

import { Modal } from "@/components/modal";

export async function loader({ params }: Route.LoaderArgs) {
  const json = (await import("@/content/data")).default;

  const pot = json.pots.find((pot) => pot.id === params.id);
  if (!pot) throw data({ error: "Not Found" }, { status: 404 });

  return { response: pot };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const params = useParams();
  const pot = loaderData.response;

  return (
    <Modal open>
      <h1>Pot {params.id}</h1>
      <pre>{JSON.stringify(pot, null, 2)}</pre>
    </Modal>
  );
}
