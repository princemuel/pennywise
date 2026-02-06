import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/budgets")({
  component: Page,
});

function Page() {
  return (
    <>
      <header>
        <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
          Budgets
        </h1>
      </header>
      <div className="p-8">
        <p>Budgets content coming soon...</p>
      </div>
    </>
  );
}
