<script lang="ts">
  const { page, first, prev, current, next, last, spread = 3 } = $props();
  const offset = $derived(Math.max(1, page.current - spread));
  const end = $derived(Math.min(page.total_page, page.current + spread));
</script>

{#if page.total_page > 1}
  <nav class="tabbed small center-align">
    {@render first()}
    {@render prev()}

    {#if offset > 1}
      <b>...</b>
    {/if}

    {#each Array(end - offset + 1) as _, index}
      {@render current(offset + index)}
    {/each}

    {#if end < page.total_page}
      <b>...</b>
    {/if}

    {@render next()}
    {@render last()}
  </nav>
{/if}
