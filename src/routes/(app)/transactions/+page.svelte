<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { range } from '@/helpers/range';

	let { data } = $props();

	const SORT_OPTIONS = [
		{ label: 'Latest', sortBy: 'date', order: 'desc' },
		{ label: 'Oldest', sortBy: 'date', order: 'asc' },
		{ label: 'A to Z', sortBy: 'name', order: 'asc' },
		{ label: 'Z to A', sortBy: 'name', order: 'desc' },
		{ label: 'Highest to Lowest', sortBy: 'amount', order: 'desc' },
		{ label: 'Lowest to Highest', sortBy: 'amount', order: 'asc' }
	];

	let currentSort = $derived(
		SORT_OPTIONS.find((opt) => opt.sortBy === data.sortBy && opt.order === data.order)
	);

	function setParam(key: string, value: string) {
		const url = new URL(page.url);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		// Reset to page 1 when filters change
		url.searchParams.delete('page');
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function setSort(sortBy: string, order: string) {
		const url = new URL(page.url);
		url.searchParams.set('sortBy', sortBy);
		url.searchParams.set('order', order);
		url.searchParams.delete('page');

		goto(url.toString(), { replaceState: true });
	}

	function setCategory(category: string) {
		setParam('category', category);
	}

	function goToPage(p: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', p.toString());

		goto(url.toString(), { replaceState: true });
	}

	const { timeZone, locale } = page.data;

	const IntlNumFmt = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'narrowSymbol',
		signDisplay: 'auto'
	});

	const toLocalString = (datetime: string) =>
		Temporal.Instant.from(datetime)
			.toZonedDateTimeISO(timeZone)
			.toLocaleString(locale, { dateStyle: 'medium' });
</script>

<section class="flex items-center">
	<label>
		<input
			type="search"
			placeholder="Search transactions…"
			value={data.search}
			oninput={(e) => setParam('search', e.currentTarget.value)}
		/>
	</label>

	<div class="relative">
		<button
			type="button"
			popovertarget="sort-menu"
			popovertargetaction="toggle"
			aria-haspopup="menu"
			aria-label="Open Sort Options"
			aria-controls="sort-menu"
			class="rounded p-2 text-grey-300 hover:text-grey-500 focus-visible:outline-2"
			style="anchor-name: --css-sort-menu;"
		>
			{currentSort?.label ?? 'Sort'} ▾
		</button>

		<dialog
			id="sort-menu"
			popover="auto"
			class="absolute inset-auto top-[anchor(top)] right-[anchor(right)] mt-6 rounded-lg bg-white opacity-0 shadow-sm transition transition-discrete duration-1000 ease-in open:grid open:opacity-100 open:starting:opacity-0"
			style="position-anchor: --css-sort-menu;"
		>
			<menu role="menu" class="flex flex-col gap-1">
				{#each SORT_OPTIONS as option (option.label)}
					<button
						type="button"
						role="menuitem"
						aria-current={option === currentSort}
						onclick={() => setSort(option.sortBy, option.order)}
					>
						{option.label}
					</button>
				{/each}
			</menu>
		</dialog>
	</div>

	<div class="relative">
		<button
			type="button"
			popovertarget="category-menu"
			popovertargetaction="toggle"
			aria-haspopup="menu"
			aria-label="Open Category Options"
			aria-controls="category-menu"
			class="rounded p-2 text-grey-300 hover:text-grey-500 focus-visible:outline-2"
			style="anchor-name: --css-cat-menu;"
		>
			{data.category || 'All Transactions'} ▾
		</button>

		<dialog
			id="category-menu"
			popover="auto"
			class="absolute inset-auto top-[anchor(top)] right-[anchor(right)] mt-6 rounded-lg bg-white opacity-0 shadow-sm transition transition-discrete duration-1000 ease-in open:grid open:opacity-100 open:starting:opacity-0"
			style="position-anchor: --css-cat-menu;"
		>
			<menu role="menu" aria-label="Filter Transactions by Category" class=" flex flex-col gap-1">
				<button
					type="button"
					role="menuitem"
					aria-current={!data.category}
					onclick={() => setCategory('')}
				>
					All Transactions
				</button>

				{#each data.categories as category (category)}
					<button
						type="button"
						role="menuitem"
						aria-current={data.category === category}
						onclick={() => setCategory(category)}
					>
						{category}
					</button>
				{/each}
			</menu>
		</dialog>
	</div>
</section>
<!-- Transactions -->
<search>
	{#if data.transactions.length === 0}
		<p>No transactions found.</p>
	{:else}
		<section>
			<header class="grid grid-cols-4 items-center gap-4">
				<p>Name</p>
				<p>Category</p>
				<p>Amount</p>
				<p>Date</p>
			</header>

			<div>
				{#each data.transactions as txn (txn.id)}
					<div class="grid grid-cols-4 items-center gap-4">
						<p>{txn.name}</p>
						<p>{txn.category}</p>
						<p>{IntlNumFmt.format(txn.amount)}</p>
						<p>{toLocalString(txn.date)}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Pagination -->
		<nav aria-label="Pagination">
			<button
				type="button"
				aria-label="Go to the previous page"
				disabled={data.currentPage <= 1}
				onclick={() => goToPage(data.currentPage - 1)}
			>
				Prev
			</button>

			{#each range(1, data.totalPages + 1) as page (page)}
				<button
					type="button"
					aria-label="Go to page {page}"
					aria-current={page === data.currentPage ? 'page' : 'false'}
					onclick={() => goToPage(page)}
				>
					{page}
				</button>
			{/each}

			<button
				type="button"
				aria-label="Go to the next page"
				disabled={data.currentPage >= data.totalPages}
				onclick={() => goToPage(data.currentPage + 1)}
			>
				Next
			</button>
		</nav>
	{/if}
</search>
