<script lang="ts">
	import type { HTMLDialogAttributes } from 'svelte/elements';

	type Props = HTMLDialogAttributes;

	let { open = $bindable(false), children, ...attrs }: Props = $props();

	let dialog: HTMLDialogElement | null = $state(null);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-modal="true"
	closedby="any"
	{...attrs}
	class={[
		'm-auto w-full max-w-xl rounded-xl bg-white p-8 shadow-xl',
		'scale-95 opacity-0 backdrop:bg-grey-900/50',
		'transition transition-discrete duration-200 ease-in',
		'open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0'
	]}
>
	<section class="flex flex-col gap-6">
		{@render children?.()}
	</section>
</dialog>
