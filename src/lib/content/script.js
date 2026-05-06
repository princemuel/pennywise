import db from './db.json' with { type: 'json' };

if (!db.transactions?.length) throw new Error('No transactions found');

let dates = db.transactions.map((tx) => Temporal.Instant.from(tx.date));

let oldest = dates[0];
let latest = dates[0];

for (const date of dates) {
	if (Temporal.Instant.compare(date, oldest) < 0) oldest = date;
	if (Temporal.Instant.compare(date, latest) > 0) latest = date;
}

console.log(oldest.toString());
console.log(latest.toString());
