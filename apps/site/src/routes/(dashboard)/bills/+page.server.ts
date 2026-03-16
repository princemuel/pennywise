import type { PageServerLoad } from "./$types";

import db from "@/lib/content/db";

export const load: PageServerLoad = async () => {
  const txns = db.transactions.filter((txn) => txn.recurring && txn.category === "Bills");
  return { data: txns, error: null };
};
