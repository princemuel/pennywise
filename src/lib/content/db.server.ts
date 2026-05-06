import db from './db.json' with { type: 'json' };
import { avatar } from './images';

export default {
	...db,
	transactions: db.transactions.map((txn) => {
		return { ...txn, avatar: avatar(txn.avatar) };
	}),
	budgets: db.budgets.map((budget) => {
		return { ...budget };
	}),
	pots: db.pots.map((pot) => {
		return { ...pot, percent: (pot.total / pot.target) * 100 };
	})
};
