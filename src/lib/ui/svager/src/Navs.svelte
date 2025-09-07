<script lang="ts">
  import Items from './items.svelte';
  import { PageState } from "../../../data/page-state.svelte";
  

  const { page } = $props<{ page: PageState }>();

  function setPage(n: number) {
    page.current = n;
  }
</script>

<Items {page}>
  {#snippet first()}
    <button class="small circle tiny-margin" onclick={() => setPage(1)} disabled={page.current < 2}>
    <i style="transform: rotate(90deg)">download</i>
    </button>
  {/snippet}
  {#snippet prev()}
    <button class="small circle tiny-margin" onclick={() => setPage(page.current - 1)} disabled={page.current < 2}>
      <i>arrow_back</i>
    </button>
  {/snippet}
  {#snippet current(n)}
    <button class="small circle tiny-margin" onclick={() => setPage(n)} disabled={page.current === n}><b>{n}</b></button>
  {/snippet}
  {#snippet next()}
    <button class="small circle tiny-margin" onclick={() => setPage(page.current + 1)} disabled={page.current >= page.total_page}>
      <i>arrow_forward</i>
    </button>
  {/snippet}
  {#snippet last()}
    <button class="small circle tiny-margin" onclick={() => setPage(page.total_page)} disabled={page.current >= page.total_page}>
    <i style="transform: rotate(270deg)">download</i>
    </button>
  {/snippet}
</Items>
