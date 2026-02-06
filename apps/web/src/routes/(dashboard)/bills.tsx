import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/bills")({
  component: Page,
});

function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Recurring Bills
        </h1>
      </header>
      <div className="p-8">
        <p>Recurring bills content coming soon...</p>
      </div>
    </>
  );
}
