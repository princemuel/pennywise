import db from '@/lib/content/db.server';
import type { PageServerLoad } from './$types';

const SORT_FIELDS = ['name', 'category', 'date', 'amount'] as const;
type SortField = (typeof SORT_FIELDS)[number];

const ORDERS = ['asc', 'desc'] as const;
type Order = (typeof ORDERS)[number];

const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ url, locals }) => {
	const rawSort = url.searchParams.get('sortBy') ?? 'date';
	const rawOrder = url.searchParams.get('orderBy') ?? 'desc';
	const search = url.searchParams.get('search') ?? '';
	const category = url.searchParams.get('category') ?? '';
	const rawPage = Number(url.searchParams.get('page') ?? '1');

	const sortBy: SortField = SORT_FIELDS.includes(rawSort as SortField)
		? (rawSort as SortField)
		: 'date';
	const orderBy: Order = ORDERS.includes(rawOrder as Order) ? (rawOrder as Order) : 'desc';
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

	const categories = [...new Set(db.transactions.map((t) => t.category))].toSorted();

	const filtered = db.transactions
		.filter((txn) => {
			const matchesSearch = txn.name
				.toLocaleLowerCase(locals.locale)
				.includes(search.toLocaleLowerCase(locals.locale));
			const matchesCategory = category ? txn.category === category : true;
			return matchesSearch && matchesCategory;
		})
		.toSorted((a, b) => {
			let cmp = 0;
			if (sortBy === 'name') cmp = a.name.localeCompare(b.name, locals.locale);
			if (sortBy === 'category') cmp = a.category.localeCompare(b.category, locals.locale);
			if (sortBy === 'date') cmp = a.date.localeCompare(b.date, locals.locale);
			if (sortBy === 'amount') cmp = a.amount - b.amount;
			return orderBy === 'asc' ? cmp : -cmp;
		});

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const currentPage = Math.min(page, totalPages || 1);
	const transactions = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	return {
		transactions,
		categories,
		sortBy,
		orderBy,
		search,
		category,
		currentPage,
		totalPages
	};
};
