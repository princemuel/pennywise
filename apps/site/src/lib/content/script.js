import db from "./db.json" with { type: "json" };

if (!db.transactions?.length) throw new Error("No transactions found");

let oldest = Infinity;
let latest = -Infinity;

for (const tx of db.transactions) {
  const t = Date.parse(tx.date);

  if (t < oldest) oldest = t;
  if (t > latest) latest = t;
}

console.log(new Date(oldest));
console.log(new Date(latest));
