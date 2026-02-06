<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'temporal-polyfill/global';
	import './globals.css';

	let { children } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health. Free personal finance app with bank-level security."
	/>
	<meta
		name="keywords"
		content="personal finance, personal finance software, budget tracker, budget planner, expense tracking, track expenses, savings goals, financial planning, money management, budget app, spending tracker, financial wellness"
	/>
	<meta name="robots" content="index, follow" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://pennywise.com" />
	<meta property="og:title" content="Pennywise - Smart Personal Finance Management" />
	<meta
		property="og:description"
		content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health."
	/>
	<meta property="og:site_name" content="Pennywise" />
	<meta property="og:image" content="https://pennywise.com/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@site" />
	<meta name="twitter:creator" content="@pennywise" />
	<meta name="twitter:title" content="Pennywise - Smart Personal Finance Management" />
	<meta
		name="twitter:description"
		content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health."
	/>
	<meta name="twitter:image" content="https://pennywise.com/og.png" />

	<link rel="icon" href={favicon} />
</svelte:head>

<html lang="en" data-scroll-behavior="smooth" class="motion-safe:scroll-smooth">
	<body class="bg-beige-100 relative min-h-svh font-sans text-base font-normal antialiased">
		{@render children()}
	</body>
</html>
