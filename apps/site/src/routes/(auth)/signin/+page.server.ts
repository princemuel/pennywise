import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { schema } from "./schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { form: await superValidate(zod4(schema)) };
};
