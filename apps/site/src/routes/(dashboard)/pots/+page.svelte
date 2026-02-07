<script lang="ts">
  import { IconEllipsis } from "@/assets/media/icons";

  let { data } = $props();
</script>

<header>
  <h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Pots</h1>
</header>

<section
  class="grid gap-8 @md/main:grid-cols-[repeat(auto-fit,minmax(clamp(24rem,100%,28rem),1fr))]"
>
  {#each data.data as pot (pot.id)}
    <article
      class="flex flex-col gap-8 rounded-xl bg-white p-6"
      style:anchor-scope="--anchor-pot"
      style={`--bg-color:${pot.theme};`}
    >
      <header class="flex items-center gap-4">
        <span class="rounded-full bg-(--bg-color) p-2"></span>

        <h4 class="text-xl font-semibold text-grey-900">
          {pot.name}
        </h4>

        <div class="relative ml-auto">
          <button
            type="button"
            popovertarget={`pot-actions-${pot.id}`}
            popovertargetaction="toggle"
            aria-haspopup="menu"
            aria-label="Open pot actions"
            aria-controls={pot.id}
            class="rounded p-2 text-grey-300 hover:text-grey-500 focus-visible:outline-2"
            style="anchor-name:--anchor-pot;"
          >
            <span class="sr-only">Open pot actions menu</span>
            <IconEllipsis class="text-xl" />
          </button>

          <div
            id={`pot-actions-${pot.id}`}
            popover="auto"
            class="absolute inset-auto top-[anchor(top)] right-[anchor(right)] m-0 mt-6 rounded-lg bg-white opacity-0 shadow-sm transition transition-discrete duration-1000 ease-in open:grid open:opacity-100 starting:open:grid starting:open:opacity-0"
            style="position-anchor:--anchor-pot;"
          >
            <menu class="flex flex-col divide-y divide-grey-100 px-6">
              <li class="py-2">
                <a
                  href={`/pots/${pot.id}/edit`}
                  aria-haspopup="dialog"
                  aria-controls={`edit-pot-modal-${pot.id}`}
                  class="text-sm text-grey-900 focus-visible:outline-2"
                >
                  Edit Pot
                </a>
              </li>

              <li class="py-2">
                <a
                  href="/pots/{pot.id}/destroy"
                  aria-haspopup="dialog"
                  aria-controls="delete-pot-modal-{pot.id}"
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
          <dd class="text-3xl font-bold text-grey-900">
            ${pot.total.toFixed(2)}
          </dd>
        </dl>

        <div
          role="progressbar"
          aria-valuenow={Math.min(100, Number(pot.percent.toFixed(2)))}
          aria-valuemin="0"
          aria-valuemax="100"
          class="h-2 overflow-hidden rounded-full bg-beige-100"
        >
          <div
            class="h-full w-(--width) rounded-full bg-(--bg-color)"
            style={`--width:${Math.min(100, Number(pot.percent.toFixed(2)))}%`}
          ></div>
        </div>

        <dl class="flex items-center justify-between">
          <dd class="text-xs font-bold text-grey-500">
            {pot.percent.toFixed(2)}%
          </dd>
          <dt class="text-xs text-grey-500">
            Target of ${pot.target.toLocaleString()}
          </dt>
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
