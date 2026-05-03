import { v7 as uuidv7 } from "uuid";

import data from "@/lib/content/db.json";

import { avatar } from "./images";

const db = {
  ...data,
  transactions: data.transactions.map((txn) => {
    return { ...txn, id: uuidv7(), avatar: avatar(txn.avatar) };
  }),
  budgets: data.budgets.map((budget) => {
    return { ...budget, id: uuidv7() };
  }),
  pots: data.pots.map((pot) => {
    return { ...pot, id: uuidv7(), percent: (pot.total / pot.target) * 100 };
  }),
};

export default db;
