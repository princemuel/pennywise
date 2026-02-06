<script lang="ts">
	import { page } from '$app/stores';
	import routes from '$lib/content/routes';
	import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from '@/assets/media/icons';

	let mini = $state(false);
	let expand = $derived(!mini);
	let uiState = $derived(expand ? 'expand' : 'compact');
	let currentPath = $derived($page.url.pathname);

	let { children } = $props();
</script>

<section class="grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-1">
	<aside
		id="sidebar"
		data-ui={`sidebar ${uiState}`}
		class={[
			'bg-grey-900 order-2 lg:order-1',
			'rounded-t-2xl px-4 pt-2 sm:px-10',
			'lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12',
			expand ? 'lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6' : 'lg:w-22 lg:grid-cols-[auto] lg:pr-2'
		]}
	>
		<div class="flex min-h-full flex-col gap-16">
			<a
				href="/"
				class="group not-in-mini:px-8 in-mini:justify-center hidden items-center py-4 text-white lg:flex"
			>
				<span class="sr-only">Home</span>
				{#if expand}
					<IconLogo />
				{:else}
					<IconLogoX />
				{/if}
			</a>

			<nav
				aria-label="Main"
				class="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
			>
				{#each routes as route (route.text)}
					{@const isActive =
						currentPath === route.href || currentPath?.startsWith(`${route.href}/`)}
					<a
						href={route.href}
						aria-current={isActive ? 'page' : undefined}
						class={[
							'flex-1 p-2 text-xs font-bold lg:text-base',
							'flex flex-col items-center justify-center gap-1',
							'lg:not-in-mini:px-8 lg:flex-row lg:gap-6 lg:p-4',
							'border-brand-400 rounded-t-xl bg-transparent lg:rounded-t-none lg:rounded-r-xl',
							'text-grey-300 hover:text-grey-100 focus:text-grey-100',
							'aria-[current=page]:bg-beige-100 aria-[current=page]:text-brand-400',
							'max-lg:aria-[current=page]:border-b-4 lg:aria-[current=page]:border-l-4'
						]}
					>
						<route.Icon class="text-2xl" aria-hidden="true" />
						<span class="sm:not-in-mini:inline-block hidden flex-1">{route.text}</span>
					</a>
				{/each}
			</nav>

			<button
				type="button"
				onclick={() => {
					mini = !mini;
				}}
				aria-controls="sidebar"
				aria-expanded={expand}
				aria-label={`${uiState} navigation`}
				class={[
					'flex w-full items-center justify-center p-2',
					'lg:not-in-mini:px-8 lg:gap-6 lg:p-4',
					'text-xs font-bold capitalize lg:text-base',
					'text-grey-300 hover:text-grey-100 focus:text-grey-100'
				]}
			>
				<IconArrowFatLinesLeft class="in-mini:rotate-180 text-2xl" aria-hidden="true" />
				<span class="sm:not-in-mini:inline-block hidden flex-1">minimize menu</span>
			</button>
		</div>
	</aside>

	<main
		aria-labelledby="a11ty-headline"
		class={['@container/main order-1 flex flex-col gap-10 overflow-y-auto', 'px-6 py-8 lg:order-2']}
	>
		{@render children()}
	</main>
</section>
