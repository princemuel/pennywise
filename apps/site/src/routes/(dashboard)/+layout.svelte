<script lang="ts">
  import { IconArrowFatLinesLeft, IconLogo, IconLogoX } from "@/assets/media/icons";
  import Navlink from "@/components/navlink.svelte";

  import routes from "@/lib/content/routes";
  import { setSidebarCookieClient } from "@/lib/cookies";

  let { data, children } = $props();

  // svelte-ignore state_referenced_locally
  let state = $state(data.sidebarState);
  let uiState = $derived(`sidebar ${state}`);

  async function toggleSidebar() {
    state = state === "compact" ? "default" : "compact";
    await setSidebarCookieClient(state);
  }
</script>

<section class="grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-1">
  <aside
    id="sidebar"
    data-ui={uiState}
    class={[
      "order-2 rounded-t-2xl bg-grey-900 px-4 pt-2 sm:px-10 lg:order-1",
      "lg:order-1 lg:rounded-r-2xl lg:p-0 lg:py-12",
      state !== "compact"
        ? "lg:w-75 lg:grid-cols-[auto_1fr] lg:pr-6"
        : "lg:w-22 lg:grid-cols-[auto] lg:pr-2"
    ]}
  >
    <div class="flex min-h-full flex-col gap-16">
      <a
        href="/"
        class="group hidden items-center py-4 text-white not-in-mini:px-8 in-mini:justify-center lg:flex"
      >
        <span class="sr-only">Home</span>
        {#if state !== "compact"}
          <IconLogo />
        {:else}
          <IconLogoX />
        {/if}
      </a>

      <nav
        aria-label="Main"
        class="flex items-center justify-between capitalize lg:flex-col lg:items-stretch lg:gap-1"
        data-sveltekit-preload-data="tap"
      >
        {#each routes as route (route.text)}
          <Navlink
            href={route.href}
            class={[
              "flex flex-1 flex-col items-center justify-center gap-1 p-2 text-xs font-bold lg:text-base",
              "lg:flex-row lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
              "rounded-t-xl border-brand-400 bg-transparent lg:rounded-t-none lg:rounded-r-xl",
              "text-grey-300 hover:text-grey-100 focus:text-grey-100",
              "data-active:bg-beige-100 data-active:text-brand-400",
              "max-lg:data-active:border-b-4 lg:data-active:border-l-4"
            ]}
          >
            <route.Icon class="text-2xl" aria-hidden="true" />
            <span class="hidden flex-1 sm:not-in-mini:inline-block">{route.text}</span>
          </Navlink>
        {/each}
      </nav>

      <div class="mt-auto hidden lg:block">
        <button
          type="button"
          aria-controls="sidebar"
          aria-expanded={state !== "compact"}
          onclick={toggleSidebar}
          data-ui={uiState}
          class={[
            "flex w-full items-center justify-center p-2 text-xs font-bold capitalize lg:text-base",
            "lg:gap-6 lg:p-4 lg:not-in-mini:px-8",
            "text-grey-300 hover:text-grey-100 focus:text-grey-100"
          ]}
        >
          <IconArrowFatLinesLeft class="text-2xl in-mini:rotate-180" aria-hidden="true" />
          <span class="hidden flex-1 sm:not-in-mini:inline-block">minimize menu</span>
        </button>
      </div>
    </div>
  </aside>

  <main
    aria-labelledby="a11ty-headline"
    class="@container/main order-1 flex flex-col gap-10 overflow-y-auto px-6 py-8 lg:order-2"
  >
    {@render children()}
  </main>
</section>
