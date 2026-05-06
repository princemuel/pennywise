<script lang="ts">
	import { page } from '$app/state';

	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'href' | 'children'> {
		/** The target URL */
		href: string;
		/** Content to render inside the link */
		children: Snippet;
		/** Match exact path only (default: false) */
		exact?: boolean;
		/** Additional CSS classes */
		class?: ClassValue | undefined | null;
	}

	let { href: url, children, exact = false, class: className = '', ...attrs }: Props = $props();

	let isActive = $derived(
		exact
			? page.url.pathname === url
			: url === '/'
				? page.url.pathname === '/'
				: page.url.pathname.startsWith(url)
	);
</script>

<a
	href={url}
	class={className}
	data-active={isActive || undefined}
	aria-current={isActive ? 'page' : undefined}
	{...attrs}
>
	{@render children()}
</a>
