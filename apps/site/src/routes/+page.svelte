<script lang="ts">
</script>

<svelte:head>
	<title>Pennywise - Smart Personal Finance Management</title>
	<meta
		name="description"
		content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health."
	/>
</svelte:head>

<main class="bg-beige-100 flex min-h-screen w-full items-center justify-center">
	<div class="text-center">
		<h1 class={['text-grey-900 mb-4 text-5xl font-bold']}>Welcome to Pennywise</h1>
		<p class={['text-grey-600 mb-8 text-lg']}>Take control of your finances</p>
		<div class="space-x-4">
			<a
				href="/auth/signin"
				class={[
					'bg-brand-500 inline-block rounded px-6 py-3 text-white',
					'hover:bg-brand-600 font-semibold transition-colors'
				]}
			>
				Sign In
			</a>
			<a
				href="/auth/signup"
				class={[
					'border-brand-500 text-brand-500 inline-block rounded border px-6 py-3',
					'hover:bg-brand-50 font-semibold transition-colors'
				]}
			>
				Sign Up
			</a>
		</div>
	</div>
</main>
