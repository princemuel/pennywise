import type { PageServerLoad } from "./$types";

import db from "@/lib/content/db";

export const load: PageServerLoad = async () => {
  return { data: db, error: null };
};
