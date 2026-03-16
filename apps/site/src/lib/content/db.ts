import { createHash } from "node:crypto";

import data from "$lib/content/db.json";
import { avatar } from "./images";

const db = {
  ...data,
  transactions: data.transactions.map((txn) => {
    return { ...id(txn), avatar: avatar(txn.avatar) };
  }),
  budgets: data.budgets.map((budget) => {
    return { ...id(budget) };
  }),
  pots: data.pots.map((pot) => {
    return { ...id(pot), percent: (pot.total / pot.target) * 100 };
  })
};

export default db;

function id<T extends object>(target: T) {
  return Object.assign(target, { id: createHash("sha1").digest("hex") });
}
