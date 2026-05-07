<script lang="ts">
	let { data } = $props();
</script>

<header>
	<h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Transactions</h1>
</header>

<section class="flex flex-col gap-5">
	{#each data.transactions as txn (txn.id)}
		<article class="grid grid-cols-5 items-center rounded-lg bg-white px-5 py-4 text-sm">
			<img src={txn.avatar} alt={txn.name} class="size-12 rounded-full" />
			<h4>{txn.name}</h4>
			<p>{txn.category}</p>
			<p>{new Intl.NumberFormat().format(txn.amount)}</p>
			<p>
				{Temporal.Instant.from(txn.date)
					.toZonedDateTimeISO(new Intl.DateTimeFormat().resolvedOptions().timeZone)
					.toPlainDateTime()
					.toLocaleString(undefined, { dateStyle: 'medium' })}
			</p>
		</article>
	{/each}
</section>
