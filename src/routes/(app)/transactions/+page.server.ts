import db from '@/lib/content/db';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;
const SORT_FIELDS = ['name', 'category', 'date', 'amount'] as const;
const ORDERS = ['asc', 'desc'] as const;
type SortField = (typeof SORT_FIELDS)[number];

function parseEnum<T extends readonly string[]>(
	element: string | null,
	valid: T,
	fallback: T[number]
): T[number] {
	return valid.includes(element as T[number]) ? (element as T[number]) : fallback;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const locale = locals.locale;
	const rawPage = Number(url.searchParams.get('page') ?? '1');

	const page = Math.max(1, Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1);
	const search = (url.searchParams.get('search') ?? '').toLocaleLowerCase(locale);
	const category = (url.searchParams.get('category') ?? '').toLocaleLowerCase(locale);

	const sortBy = parseEnum(url.searchParams.get('sortBy'), SORT_FIELDS, 'date');
	const orderBy = parseEnum(url.searchParams.get('orderBy'), ORDERS, 'desc');

	const comparators: Record<
		SortField,
		(a: (typeof db.transactions)[number], b: (typeof db.transactions)[number]) => number
	> = {
		name: (a, b) => a.name.localeCompare(b.name, locale),
		category: (a, b) => a.category.localeCompare(b.category, locale),
		date: (a, b) => a.date.localeCompare(b.date, locale),
		amount: (a, b) => a.amount - b.amount
	};

	const categories = [...new Set(db.transactions.map((t) => t.category).toSorted())];

	const filtered = db.transactions
		.filter((txn) => {
			const matchesSearch = txn.name.toLocaleLowerCase(locals.locale).includes(search);
			const matchesCategory = !category || txn.category.toLocaleLowerCase(locale) === category;
			return matchesSearch && matchesCategory;
		})
		.toSorted((a, b) => {
			const cmp = comparators[sortBy](a, b);
			return orderBy === 'asc' ? cmp : -cmp;
		});

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const currentPage = Math.min(page, totalPages || 1);
	const start = (currentPage - 1) * PAGE_SIZE;
	const transactions = filtered.slice(start, start + PAGE_SIZE);

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
