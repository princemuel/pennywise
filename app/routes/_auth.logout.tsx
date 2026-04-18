import { Form } from "react-router";

import { destroyAuthSession } from "@/lib/auth.server";

import type { Route } from "./+types/_auth.logout";

export async function action({ request }: Route.ActionArgs) {
  return destroyAuthSession(request);
}

export default function Page() {
  return (
    <main>
      <h1>Sign out</h1>
      <p>Are you sure you want to sign out?</p>
      <Form method="post">
        <button type="submit">Confirm sign out</button>
      </Form>
    </main>
  );
}
