import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/transactions")({
  component: Page,
});

function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Transactions
        </h1>
      </header>
      <div className="p-8">
        <p>Transactions content coming soon...</p>
      </div>
    </>
  );
}
