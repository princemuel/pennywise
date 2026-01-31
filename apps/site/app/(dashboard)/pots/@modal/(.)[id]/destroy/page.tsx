import Form from "next/form";
import Link from "next/link";

import { notFound } from "next/navigation";

import { destroyPot } from "@/actions/pot";
import { IconCircleX } from "@/assets/media/icons";
import { Dialog } from "@/components/dialog";

export default async function Page({ params }: PageProps<"/pots/[id]/destroy">) {
  const { id } = await params;
  const json = (await import("@/lib/content/data")).default;

  const pot = json.pots.find((pot) => pot.id === id);
  if (!pot) notFound();

  const destroyPotWithid = destroyPot.bind(null, id);

  return (
    <Dialog closedby="closerequest" aria-labelledby={`delete-pot-title-${pot.id}`}>
      <header className="flex items-center justify-between">
        <h1 id={`delete-pot-title-${pot.id}`} className="text-2xl font-bold text-grey-900">
          Delete &lsquo;Pot&rsquo;?
        </h1>
        <Link href="/pots">
          <span className="sr-only">Close Modal</span>
          <IconCircleX className="text-2xl" />
        </Link>
      </header>

      <p className="text-sm text-grey-500">
        Are you sure you want to delete this pot? This action cannot be reversed, and all the data
        inside it will be removed forever.
      </p>

      <section className="flex flex-col gap-5 text-center">
        <Form action={destroyPotWithid} className="flex-1">
          <input type="hidden" name="" />
          <button type="submit" className="w-full rounded-lg bg-brand-200 px-5 py-4 text-white">
            Yes, Confirm Deletion
          </button>
        </Form>

        <Link href="/pots" className="flex-1 text-center text-sm text-grey-500">
          No, Go Back
        </Link>
      </section>
    </Dialog>
  );
}
