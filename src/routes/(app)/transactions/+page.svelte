<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

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
		SORT_OPTIONS.find((o) => o.sortBy === data.sortBy && o.order === data.order)
	);

	let sortOpen = $state(false);
	let categoryOpen = $state(false);

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
		sortOpen = false;
	}

	function setCategory(category: string) {
		setParam('category', category);
		categoryOpen = false;
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
		signDisplay: 'exceptZero'
	});

	const date = (datetime: string) =>
		Temporal.Instant.from(datetime)
			.toZonedDateTimeISO(timeZone)
			.toLocaleString(locale, { dateStyle: 'medium' });
</script>

<!-- Search -->
<input
	type="search"
	placeholder="Search transactions…"
	value={data.search}
	oninput={(e) => setParam('search', e.currentTarget.value)}
/>

<!-- Sort popover -->
<div class="relative">
	<button onclick={() => (sortOpen = !sortOpen)}>
		{currentSort?.label ?? 'Sort'} ▾
	</button>

	{#if sortOpen}
		<div role="menu" class="absolute flex flex-col gap-1">
			{#each SORT_OPTIONS as opt (opt.label)}
				<button
					role="menuitem"
					aria-current={opt === currentSort ? 'true' : undefined}
					onclick={() => setSort(opt.sortBy, opt.order)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Category popover -->
<div class="relative mt-16">
	<button onclick={() => (categoryOpen = !categoryOpen)}>
		{data.category || 'All Transactions'} ▾
	</button>
	{#if categoryOpen}
		<div role="menu" class="absolute flex flex-col gap-1">
			<button
				role="menuitem"
				aria-current={!data.category ? 'true' : undefined}
				onclick={() => setCategory('')}
			>
				All Transactions
			</button>
			{#each data.categories as cat (cat)}
				<button
					role="menuitem"
					aria-current={data.category === cat ? 'true' : undefined}
					onclick={() => setCategory(cat)}
				>
					{cat}
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Transactions -->
{#if data.transactions.length === 0}
	<p>No transactions found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Category</th>
				<th>Date</th>
				<th>Amount</th>
			</tr>
		</thead>

		<tbody>
			{#each data.transactions as txn (txn.id)}
				<tr>
					<td>{txn.name}</td>
					<td>{txn.category}</td>
					<td>{date(txn.date)}</td>
					<td>{IntlNumFmt.format(txn.amount)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Pagination -->
	<nav aria-label="Pagination">
		<button disabled={data.currentPage <= 1} onclick={() => goToPage(data.currentPage - 1)}>
			Prev
		</button>

		{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as page (page)}
			<button
				aria-current={page === data.currentPage ? 'page' : undefined}
				onclick={() => goToPage(page)}
			>
				{page}
			</button>
		{/each}

		<button
			disabled={data.currentPage >= data.totalPages}
			onclick={() => goToPage(data.currentPage + 1)}
		>
			Next
		</button>
	</nav>
{/if}
