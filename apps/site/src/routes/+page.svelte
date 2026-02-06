<script lang="ts">
</script>

<svelte:head>
  <title>Pennywise - Smart Personal Finance Management</title>
  <meta
    name="description"
    content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health."
  />
</svelte:head>

<main class="flex min-h-screen w-full items-center justify-center bg-beige-100">
  <div class="flex flex-col gap-8 text-center">
    <h1 class={"mb-4 text-5xl font-bold text-grey-900"}>Welcome to Pennywise</h1>
    <p class={"text-grey-600 text-lg"}>Take control of your finances</p>
    <div class="space-x-4">
      <a
        href="/signin"
        class={[
          "inline-block rounded bg-brand-500 px-6 py-3 text-white",
          "font-semibold transition-colors hover:bg-brand-600"
        ]}
      >
        Sign In
      </a>
      <a
        href="/signup"
        class={[
          "inline-block rounded border border-brand-500 px-6 py-3 text-brand-500",
          "hover:bg-brand-50 font-semibold transition-colors"
        ]}
      >
        Sign Up
      </a>
    </div>
  </div>
</main>
