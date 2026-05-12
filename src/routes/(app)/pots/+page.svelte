<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { IconCircleX, IconEllipsis } from '@/assets/media/icons';
	import Dialog from '@/components/dialog.svelte';
	import Pot from '@/components/pot.svelte';
	import { Control, Field, FieldErrors, Label } from 'formsnap';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { PotChangeset } from './schema.js';

	let { data } = $props();

	const createPotForm = (() => {
		const formVal = (() => data.createPotForm)();
		return superForm(formVal, {
			id: 'create-pot',
			resetForm: true,
			validators: zod4Client(PotChangeset)
		});
	})();
	const editPotForm = (() => {
		const formVal = (() => data.editPotForm)();
		return superForm(formVal, {
			id: 'edit-pot',
			resetForm: true,
			validators: zod4Client(PotChangeset)
		});
	})();

	const { form: createPotFormData } = createPotForm;
	const { form: editPotFormData } = editPotForm;
</script>

<header class="flex items-center justify-between">
	<h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Pots</h1>
	<button
		type="button"
		command="show-modal"
		commandfor="create-pot-modal"
		class="rounded-lg bg-grey-900 p-4 text-sm font-bold text-white"
	>
		+ Add New Pot
	</button>
</header>

<section class="grid gap-8 @md:grid-cols-[repeat(auto-fit,minmax(24rem,1fr))]">
	{#each data.pots as pot (pot.id)}
		{@const percent = Math.min(100, Number(pot.percent.toFixed(2)))}
		<article
			class="isolate flex flex-col gap-8 rounded-xl bg-white p-6"
			style="--theme: #{pot.theme}; anchor-scope: --css-pot-menu;"
		>
			<header class="flex items-center gap-4">
				<span class="rounded-full bg-(--theme) p-2"></span>
				<h4 id="pot-label-{pot.id}" class="text-xl font-semibold text-grey-900">{pot.name}</h4>

				<div class="relative ml-auto">
					<button
						type="button"
						popovertarget={pot.id}
						popovertargetaction="toggle"
						aria-haspopup="menu"
						aria-label="Open pot actions menu"
						aria-controls={pot.id}
						class="rounded p-2 text-grey-300 hover:bg-grey-100 hover:text-grey-500 focus-visible:outline-2"
						style="anchor-name: --css-pot-menu;"
					>
						<span class="sr-only">Open pot actions menu</span>
						<IconEllipsis class="text-xl" />
					</button>

					<dialog
						id={pot.id}
						popover="auto"
						class={[
							'absolute inset-auto top-[anchor(top)] right-[anchor(right)]',
							'mt-6 rounded-lg bg-white opacity-0 shadow-sm',
							'transition transition-discrete duration-1000 ease-in',
							'open:grid open:opacity-100 starting:open:opacity-0'
						]}
						style="position-anchor: --css-pot-menu;"
					>
						<menu role="menu" class="flex flex-col divide-y divide-grey-100 px-6">
							<li class="py-2">
								<a
									href="?id={pot.id}&intent=edit"
									aria-haspopup="dialog"
									aria-controls="edit-{pot.id}"
									class="text-sm text-grey-900 focus-visible:outline-2"
								>
									Edit Pot
								</a>
							</li>

							<li class="py-2">
								<a
									href="?id={pot.id}&intent=delete"
									aria-haspopup="dialog"
									aria-controls="delete-{pot.id}"
									class="text-sm text-brand-200 focus-visible:outline-2"
								>
									Delete Pot
								</a>
							</li>
						</menu>
					</dialog>
				</div>
			</header>

			<div class="flex flex-col gap-4">
				<dl class="flex items-center justify-between">
					<dt class="text-sm text-grey-500">Total Saved</dt>
					<dd class="text-3xl font-bold text-grey-900">${pot.total.toFixed(2)}</dd>
				</dl>

				<div
					role="progressbar"
					aria-label="{pot.name} pots' progress"
					aria-valuenow={percent}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuetext="{percent}% saved"
					class="h-2 overflow-hidden rounded-full bg-beige-100"
				>
					<div
						class="h-full w-(--width) rounded-full bg-(--theme)"
						style="--width: {percent}%"
					></div>
				</div>

				<dl class="flex flex-row-reverse items-center justify-between">
					<dt class="text-xs text-grey-500">Target of ${pot.target.toLocaleString()}</dt>
					<dd class="text-xs font-bold text-grey-500">{pot.percent.toFixed(2)}%</dd>
				</dl>
			</div>

			<section class="flex items-center justify-between gap-4">
				<button
					type="button"
					class="flex-1 rounded-lg bg-beige-100 p-4 text-sm font-bold text-grey-900"
				>
					+ Add Money
				</button>

				<button
					type="button"
					class="flex-1 rounded-lg bg-beige-100 p-4 text-sm font-bold text-grey-900"
				>
					Withdraw
				</button>
			</section>
		</article>
	{/each}
</section>

<Dialog id="create-pot-modal" onclose={() => goto(resolve('/pots'), { replaceState: true })}>
	<header class="flex items-center justify-between">
		<h2 id="create-pot-headline" class="text-2xl font-bold text-grey-900">Add New Pot</h2>

		<button type="button" commandfor="create-pot-modal" command="close">
			<span class="sr-only">Close modal</span>
			<IconCircleX role="img" class="text-2xl" />
		</button>
	</header>

	<p class="text-sm text-grey-500">
		Create a pot to set savings targets. These can help keep you on track as you save for special
		purchases.
	</p>

	{@const { enhance } = createPotForm}
	<form method="POST" action="?/create" class="grid grid-cols-6 gap-5" use:enhance>
		<Pot />

		<div class="group col-span-full flex flex-col gap-2">
			<Field form={createPotForm} name="name">
				<Control>
					{#snippet children({ props })}
						<Label class="text-xs font-bold text-grey-500">Name</Label>
						<input
							{...props}
							type="text"
							bind:value={$createPotFormData.name}
							class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
						/>
					{/snippet}
				</Control>
				<FieldErrors class="self-end text-xs text-red-400" />
			</Field>
		</div>

		<div class="group col-span-full flex flex-col gap-2">
			<Field form={createPotForm} name="target">
				<Control>
					{#snippet children({ props })}
						<Label class="text-xs font-bold text-grey-500">Target</Label>
						<input
							{...props}
							type="number"
							min={0}
							step={0.01}
							bind:value={$createPotFormData.target}
							class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
						/>
					{/snippet}
				</Control>
				<FieldErrors class="self-end text-xs text-red-400" />
			</Field>
		</div>

		<div class="group col-span-full flex flex-col gap-2">
			<Field form={createPotForm} name="theme">
				<Control>
					{#snippet children({ props })}
						<Label class="text-xs font-bold text-grey-500">Theme</Label>
						<input
							{...props}
							type="text"
							bind:value={$createPotFormData.theme}
							class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
						/>
					{/snippet}
				</Control>
				<FieldErrors class="self-end text-xs text-red-400" />
			</Field>
		</div>

		<button type="submit" class="col-span-full rounded-lg bg-grey-900 py-4 text-center text-white">
			Add Pot
		</button>
	</form>
</Dialog>

{#if data.selected && data.intent === 'edit'}
	{@const open = data.selected && data.intent === 'edit'}

	<Dialog
		{open}
		id="edit-{data.selected.id}"
		aria-labelledby="edit-pot-{data.selected.id}"
		onclose={() => goto(resolve('/pots'), { replaceState: true })}
	>
		<header class="flex items-center justify-between">
			<h2 id="edit-pot-{data.selected.id}" class="text-2xl font-bold text-grey-900">Edit Pot</h2>

			<a href="/pots">
				<span class="sr-only">Close modal</span>
				<IconCircleX role="img" class="text-2xl" />
			</a>
		</header>

		<p class="text-sm text-grey-500">
			If your saving targets change, feel free to update your pots.
		</p>

		{@const { enhance } = editPotForm}
		<form
			method="POST"
			action="?/edit&id={data.selected.id}"
			class="grid grid-cols-6 gap-5"
			use:enhance
		>
			<Pot />

			<div class="group col-span-full flex flex-col gap-2">
				<Field form={editPotForm} name="name">
					<Control>
						{#snippet children({ props })}
							<Label class="text-xs font-bold text-grey-500">Name</Label>
							<input
								{...props}
								type="text"
								bind:value={$editPotFormData.name}
								class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
							/>
						{/snippet}
					</Control>
					<FieldErrors class="self-end text-xs text-red-400" />
				</Field>
			</div>

			<div class="group col-span-full flex flex-col gap-2">
				<Field form={editPotForm} name="target">
					<Control>
						{#snippet children({ props })}
							<Label class="text-xs font-bold text-grey-500">Target</Label>
							<input
								{...props}
								type="number"
								min={0}
								step={0.01}
								bind:value={$editPotFormData.target}
								class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
							/>
						{/snippet}
					</Control>
					<FieldErrors class="self-end text-xs text-red-400" />
				</Field>
			</div>

			<div class="group col-span-full flex flex-col gap-2">
				<Field form={editPotForm} name="theme">
					<Control>
						{#snippet children({ props })}
							<Label class="text-xs font-bold text-grey-500">Theme</Label>
							<input
								{...props}
								type="text"
								bind:value={$editPotFormData.theme}
								class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
							/>
						{/snippet}
					</Control>
					<FieldErrors class="self-end text-xs text-red-400" />
				</Field>
			</div>

			<button
				type="submit"
				class="col-span-full rounded-lg bg-grey-900 py-4 text-center text-white"
			>
				Save Changes
			</button>
		</form>
	</Dialog>
{/if}

{#if data.selected && data.intent === 'delete'}
	{@const open = data.selected && data.intent === 'delete'}
	<Dialog
		{open}
		id="delete-{data.selected.id}"
		aria-labelledby="delete-pot"
		onclose={() => goto(resolve('/pots'), { replaceState: true })}
	>
		<header class="flex items-center justify-between">
			<h2 id="delete-pot" class="text-2xl font-bold text-grey-900">
				Delete ߵ{data.selected.name}ߴ?
			</h2>

			<a href="/pots" aria-label="Close modal">
				<IconCircleX class="text-2xl" />
			</a>
		</header>

		<p class="text-sm text-grey-500">
			Are you sure you want to delete this pot? This action cannot be reversed, and all the data
			inside it will be removed forever.
		</p>

		<section class="flex flex-col gap-4 text-center">
			<form method="POST" action="?/delete&id={data.selected.id}" class="flex-1">
				<button type="submit" class="w-full rounded-lg bg-brand-200 px-5 py-4 text-white">
					Yes, Confirm Deletion
				</button>
			</form>

			<a href="/pots" class="flex-1 text-center text-sm text-grey-500">No, Go Back</a>
		</section>
	</Dialog>
{/if}
