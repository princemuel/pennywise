<script lang="ts">
  let { name = "fruit" } = $props();
</script>

<input
  type="text"
  {name}
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
  class="absolute top-auto -left-2500 h-px w-px overflow-hidden"
/>
