import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/pots")({
  component: Page,
});

function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Pots
        </h1>
      </header>
      <div className="p-8">
        <p>Pots content coming soon...</p>
      </div>
    </>
  );
}
