<script lang="ts">
	import type { HTMLDialogAttributes } from 'svelte/elements';

	type Props = HTMLDialogAttributes;

	let { children, ...attrs }: Props = $props();
</script>

<dialog {...attrs} class={['fixed inset-0 h-dvh w-full bg-transparent', attrs.class]}>
	<!-- z-index only needs to beat siblings; since dialog is outside `isolate` div, any value works -->
	<div class="fixed inset-0 z-10 bg-black/50"></div>
	<div class="fixed inset-0 z-20 flex items-center justify-center px-4">
		<div class="w-full max-w-xl rounded-xl bg-white p-8 shadow-xl">
			<section class="flex flex-col gap-6">
				{@render children?.()}
			</section>
		</div>
	</div>
</dialog>
