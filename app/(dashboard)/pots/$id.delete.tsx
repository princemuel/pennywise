import { data, Link, useFetcher, useNavigate } from "react-router";
import type { Route } from "./+types/$id.delete";

import { IconCircleX } from "@/assets/media/icons";
import { Dialog } from "@/components/dialog";

export async function loader({ params }: Route.LoaderArgs) {
  const json = (await import("@/content/data")).default;

  const pot = json.pots.find((pot) => pot.id === params.id);
  if (!pot) throw data({ error: "Not Found" }, { status: 404 });

  return { response: pot };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const pot = loaderData.response;
  const navigate = useNavigate();
  const fetcher = useFetcher();

  return (
    <Dialog
      onCancel={() => navigate(-1)}
      closedby="any"
      aria-labelledby={`delete-pot-title-${pot.id}`}
    >
      <header className="flex items-center justify-between">
        <h1 id={`delete-pot-title-${pot.id}`} className="text-2xl font-bold text-grey-900">
          Delete ‘Pot #{pot.id}’ ?
        </h1>
        <Link to="/pots" viewTransition>
          <span className="sr-only">Close Modal</span>
          <IconCircleX className="text-2xl" />
        </Link>
      </header>

      <p className="text-sm text-grey-500">
        Are you sure you want to delete this pot? This action cannot be reversed, and all the data
        inside it will be removed forever.
      </p>

      <section className="flex flex-col gap-5 text-center">
        <fetcher.Form method="post" className="flex-1">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-200 px-5 py-4 text-white"
            disabled={fetcher.state !== "idle"}
          >
            Yes, Confirm Deletion
          </button>
        </fetcher.Form>

        <Link to="/pots" viewTransition className="flex-1 text-center text-sm text-grey-500">
          No, Go Back
        </Link>
      </section>
    </Dialog>
  );
}

export async function action({ params, request }: Route.ActionArgs) {
  const json = (await import("@/content/data")).default;

  const formData = await request.formData();

  console.log(formData.entries());

  const potIndex = json.pots.findIndex((pot) => pot.id === params.id);
  if (potIndex === -1) {
    return data({ ok: false, error: "Pot not found" }, { status: 404 });
  }

  // Remove the pot from the data
  json.pots.splice(potIndex, 1);

  // Here you would typically persist the updated data back to your database or file system.
  // For this example, we'll just return a success response.

  return data({ ok: true });
}
