<script lang="ts">
  import { IconCaretRight } from "@/assets/media/icons";
  let { data } = $props();
</script>

<svelte:head>
  <title>Pennywise - Smart Personal Finance Management</title>
  <meta
    name="description"
    content="Take control of your finances with Pennywise. Track spending, manage budgets, reach savings goals, and gain insights into your financial health."
  />
</svelte:head>

<header>
  <h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Overview</h1>
</header>

<section class="grid auto-cols-fr gap-8 sm:grid-cols-3">
  <article class="flex flex-col gap-3 rounded-xl bg-grey-900 p-6 xl:p-8">
    <h4 class="text-sm text-white">Current Balance</h4>
    <p class="text-3xl font-bold text-white">${data.data.balance.current.toFixed(2)}</p>
  </article>
  <article class="md flex flex-col gap-3 rounded-xl bg-white p-6 xl:p-8">
    <h4 class="text-sm text-grey-500">Income</h4>
    <p class="text-3xl font-bold text-grey-900">${data.data.balance.income.toFixed(2)}</p>
  </article>
  <article class="flex flex-col gap-3 rounded-xl bg-white p-6 xl:p-8">
    <h4 class="text-sm text-grey-500">Expenses</h4>
    <p class="text-3xl font-bold text-grey-900">${data.data.balance.expenses.toFixed(2)}</p>
  </article>
</section>

<section class="@container grid auto-rows-auto grid-cols-5 gap-8">
  <article
    aria-labelledby="pots"
    class="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 @4xl:col-span-3"
  >
    <header class="flex items-center justify-between">
      <h3 id="pots" class="text-xl font-bold text-grey-900">Pots</h3>
      <a href="/pots" class="flex items-center gap-4 text-sm text-grey-500">
        <span>See Details</span>
        <IconCaretRight />
      </a>
    </header>

    <div class="col-span-full grid gap-6 @2xl:grid-cols-5">
      <div class="col-span-full rounded-xl bg-beige-100 p-6 @2xl:col-span-2">
        <h5 class="text-sm text-grey-500">Total Saved</h5>
        <p class="text-3xl font-bold text-grey-900">
          ${data.data.pots.reduce((total, item) => total + item.total, 0)}
        </p>
      </div>

      <div class="col-span-full grid auto-cols-fr grid-cols-2 gap-4 @2xl:col-span-3">
        {#each data.data.pots.slice(0, 4) as pot (pot.id)}
          <div class="flex items-center gap-4" style="--color:{pot.theme};">
            <div class="h-full w-1 rounded-full bg-(--color)"></div>
            <div class="flex flex-1 flex-col gap-2">
              <h6 class="text-xs text-grey-500">{pot.name}</h6>
              <p class="text-sm font-bold text-grey-900">${pot.total.toLocaleString()}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </article>

  <article
    aria-labelledby="budgets"
    class="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 @4xl:col-span-2 @4xl:row-span-3"
  >
    <header class="flex items-center justify-between">
      <h3 id="budgets" class="text-xl font-bold text-grey-900">Budgets</h3>
      <a href="/budgets" class="flex items-center gap-4 text-sm text-grey-500">
        <span>See Details</span>
        <IconCaretRight />
      </a>
    </header>
  </article>

  <article
    aria-labelledby="transactions"
    class="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 @4xl:col-span-3 @4xl:row-span-4"
  >
    <header class="flex items-center justify-between">
      <h3 id="transactions" class="text-xl font-bold text-grey-900">Transactions</h3>
      <a href="/transactions" class="flex items-center gap-4 text-sm text-grey-500">
        <span>View All</span>
        <IconCaretRight />
      </a>
    </header>
  </article>

  <article
    aria-labelledby="bills"
    class="col-span-full flex flex-col gap-6 rounded-xl bg-white p-6 @4xl:col-span-2 @4xl:row-span-2"
  >
    <header class="flex items-center justify-between">
      <h3 id="bills" class="text-xl font-bold text-grey-900">Recurring Bills</h3>
      <a href="/bills" class="flex items-center gap-4 text-sm text-grey-500">
        <span>See Details</span>
        <IconCaretRight />
      </a>
    </header>
  </article>
</section>
