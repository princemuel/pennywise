<script lang="ts">
  import { IconLogo } from "@/assets/media/icons";
  import { ImageIllustration } from "@/assets/media/images";

  let { children } = $props();
</script>

<main
  aria-labelledby="a11ty-headline"
  class="@container grid h-svh w-full grid-rows-[auto_1fr] lg:grid-cols-12 lg:grid-rows-1"
>
  <header
    class="col-span-full flex items-center justify-center rounded-b-xl bg-grey-900 py-6 text-white lg:hidden"
  >
    <IconLogo />
  </header>

  <section class="col-span-5 hidden p-5 lg:block">
    <div
      class="flex h-full flex-col justify-between rounded-xl bg-(image:--bgImg) bg-cover bg-no-repeat p-16"
      style:--bgImg={`url(${ImageIllustration})`}
    >
      <IconLogo class="text-white" />
      <hgroup class="space-y-6">
        <h2 class="text-3xl font-bold text-white">
          Keep track of your money and save for your future
        </h2>
        <p class="text-sm text-white">
          Personal finance app puts you in control of your spending. Track transactions, set
          budgets, and add to savings pots easily.
        </p>
      </hgroup>
    </div>
  </section>

  <section class="self-center px-[6cqw] lg:col-span-7">{@render children()}</section>
</main>
