<script lang="ts">
	import { signUpSchema } from '$lib/schema/auth';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const form = $derived.by(() =>
		superForm(data.form, {
			validators: zod(signUpSchema),
			taintedMessage: false
		})
	);

	const { form: formData, enhance, errors } = $derived(form);
</script>

<main class="bg-beige-100 flex min-h-screen w-full items-center justify-center px-4">
	<form
		action="?/signup"
		method="POST"
		use:enhance
		class={[
			'mx-auto flex w-full max-w-2xl flex-col gap-8',
			'rounded-xl bg-white px-8 py-12 shadow-md'
		]}
	>
		<h1 id="a11ty-headline" class="text-grey-900 text-4xl font-bold">Sign Up</h1>

		<div class="flex flex-col gap-4">
			<label for={$formData.name} class="flex flex-col gap-2">
				<span class="text-grey-900 text-sm font-semibold">Name</span>
				<input
					type="text"
					name="name"
					value={$formData.name}
					placeholder="John Doe"
					class={[
						'rounded border px-4 py-2',
						$errors.name ? 'border-red-500 bg-red-50' : 'border-grey-300 bg-white'
					]}
				/>
				{#if $errors.name}
					<span class="text-sm text-red-500">{$errors.name[0]}</span>
				{/if}
			</label>

			<label for={$formData.email} class="flex flex-col gap-2">
				<span class="text-grey-900 text-sm font-semibold">Email</span>
				<input
					type="email"
					name="email"
					value={$formData.email}
					placeholder="user@example.com"
					class={[
						'rounded border px-4 py-2',
						$errors.email ? 'border-red-500 bg-red-50' : 'border-grey-300 bg-white'
					]}
				/>
				{#if $errors.email}
					<span class="text-sm text-red-500">{$errors.email[0]}</span>
				{/if}
			</label>

			<label for={$formData.password} class="flex flex-col gap-2">
				<span class="text-grey-900 text-sm font-semibold">Password</span>
				<input
					type="password"
					name="password"
					value={$formData.password}
					placeholder="••••••••"
					class={[
						'rounded border px-4 py-2',
						$errors.password ? 'border-red-500 bg-red-50' : 'border-grey-300 bg-white'
					]}
				/>
				{#if $errors.password}
					<span class="text-sm text-red-500">{$errors.password[0]}</span>
				{/if}
			</label>
		</div>

		<button
			type="submit"
			class={[
				'bg-brand-500 rounded px-6 py-2 font-semibold text-white',
				'hover:bg-brand-600 transition-colors'
			]}
		>
			Create Account
		</button>

		<p class="text-grey-500 text-center text-sm">
			Already have an account?{' '}
			<a href="/auth/signin" class="text-brand-500 hover:text-brand-600 font-semibold"> Sign In </a>
		</p>
	</form>
</main>
