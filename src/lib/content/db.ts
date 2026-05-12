import raw from './db.json' with { type: 'json' };
import { avatar } from './images';

export default {
	...raw,
	transactions: raw.transactions.map((txn) => {
		return { ...txn, avatar: avatar(txn.avatar) };
	}),
	budgets: raw.budgets.map((budget) => {
		return { ...budget };
	}),
	pots: raw.pots.map((pot) => {
		return { ...pot, percent: (pot.total / pot.target) * 100 };
	})
};
