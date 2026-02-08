import { createHash } from "node:crypto";

import data from "$lib/content/db.json";

const db = {
  ...data,
  transactions: data.transactions.map((transaction) => {
    return { ...id(transaction, transaction.name) };
  }),
  budgets: data.budgets.map((budget) => {
    return { ...id(budget, budget.category) };
  }),
  pots: data.pots.map((pot) => {
    return { ...id(pot, pot.name), percent: (pot.total / pot.target) * 100 };
  })
};

export default db;

function id<T extends object>(target: T, data: string) {
  return Object.assign(target, { id: createHash("sha1").update(data).digest("hex").slice(0, 6) });
}
