<script lang="ts">
	import { IconEllipsis } from '@/assets/media/icons';

	let { data } = $props();

	const isEditing = $derived(data.modal === 'edit' && !!data.selected);
	const isDeleting = $derived(data.modal === 'delete' && !!data.selected);
</script>

<header>
	<h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Pots</h1>
</header>

<section class="grid gap-8 @md:grid-cols-[repeat(auto-fit,minmax(24rem,1fr))]">
	{#each data.pots as pot (pot.id)}
		{@const percent = Math.min(100, Number(pot.percent.toFixed(2)))}
		<article
			class="flex flex-col gap-8 rounded-xl bg-white p-6"
			style="--theme: {pot.theme}; anchor-scope: --anchor-pot;"
		>
			<header class="flex items-center gap-4">
				<span class="rounded-full bg-(--theme) p-2"></span>
				<h4 id="pot-label-{pot.id}" class="text-xl font-semibold text-grey-900">{pot.name}</h4>
				<div class="relative ml-auto">
					<button
						type="button"
						popovertarget="pot-actions-{pot.id}"
						popovertargetaction="toggle"
						aria-haspopup="menu"
						aria-label="Open pot actions"
						aria-controls={pot.id}
						class="rounded p-2 text-grey-300 hover:text-grey-500 focus-visible:outline-2"
						style="anchor-name: --anchor-pot;"
					>
						<span class="sr-only">Open pot actions menu</span>
						<IconEllipsis class="text-xl" />
					</button>

					<!-- NOTE: replace auto with hint when Safari finally supports it -->
					<div
						id="pot-actions-{pot.id}"
						popover="hint"
						class="absolute inset-auto top-[anchor(top)] right-[anchor(right)] m-0 mt-6 rounded-lg bg-white opacity-0 shadow-sm transition transition-discrete duration-1000 ease-in open:grid open:opacity-100 starting:open:grid starting:open:opacity-0"
						style="position-anchor: --anchor-pot;"
					>
						<menu class="flex flex-col divide-y divide-grey-100 px-6">
							<li class="py-2">
								<a
									href="?modal=edit&id={pot.id}"
									aria-haspopup="dialog"
									aria-controls="edit-{pot.id}"
									class="text-sm text-grey-900 focus-visible:outline-2"
								>
									Edit Pot
								</a>
							</li>

							<li class="py-2">
								<a
									href="?modal=delete&id={pot.id}"
									aria-haspopup="dialog"
									aria-controls="delete-{pot.id}"
									class="text-sm text-brand-200 focus-visible:outline-2"
								>
									Delete Pot
								</a>
							</li>
						</menu>
					</div>
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

{#if isEditing}
	<div class="backdrop">
		<dialog open>
			<header>
				<h2>Edit Pot #{data.selected?.id}</h2>
				<a href="/pots">✕</a>
			</header>

			<form method="POST" action="?/edit&id={data.selected?.id}">
				<label>
					Title
					<input name="title" value={data.selected?.name} />
				</label>
				<button type="submit">Save</button>
			</form>
		</dialog>
	</div>
{/if}

<!-- delete dialog -->
{#if isDeleting}
	<div class="backdrop">
		<dialog open>
			<header>
				<h2>Delete pot {data.selected?.id}?</h2>
				<a href="/pots">✕</a>
			</header>

			<p>Are you sure you want to delete "{data.selected?.name}"?</p>

			<form method="POST" action="?/delete&id={data.selected?.id}">
				<a href="/pots">Cancel</a>
				<button type="submit">Delete</button>
			</form>
		</dialog>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: hsl(0 0% 0% / 0.5);
		display: grid;
		place-items: center;
	}

	dialog {
		width: min(90vw, 400px);
		border-radius: 8px;
		padding: 1.5rem;
	}
</style>
