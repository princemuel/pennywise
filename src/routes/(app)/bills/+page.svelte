<script lang="ts">
	let { data } = $props();
</script>

<header>
	<h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Recurring Bills</h1>
</header>

<pre>{JSON.stringify(data.bills, null, 2)}</pre>
