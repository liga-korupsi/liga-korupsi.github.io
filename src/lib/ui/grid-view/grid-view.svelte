<script lang="ts">
    import { onMount } from "svelte";
    import Spinner from "../spinner.svelte";
    import type { Fetcher } from "../../data/fetcher.svelte";

    let table: HTMLTableElement;
    let columnLen = $state(0)
    let { dataFetcher: data, buttons, columns, filters, dataRow }: {
        dataFetcher: Fetcher,
        buttons?: () => any,
        columns: (handleSort: (e: MouseEvent | KeyboardEvent) => void, handleKeyDown: (e: KeyboardEvent) => void) => any,
        filters?: () => any,
        dataRow: (row: any, index: number) => any
    } = $props()

    $effect(() => {
        data.fetchList();
    });

    onMount(() => {
        columnLen = table.querySelectorAll('th').length
    })

    function handleSort(e: MouseEvent | KeyboardEvent) {
        const target = e.target as HTMLElement;
        const key = target.dataset.key || (target.parentElement as HTMLElement)?.dataset.key;
        if (key) {
            data.sort(key);
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            handleSort(e);
        }
    }
</script>

<div class="table-responsive">
    {#if buttons}
        {@render buttons()}<br />
    {/if}

    <figure>
        <table bind:this={table} class="stripes {data.ready || data.rows.length || 'center-align'}">
            <thead>
                <!-- {#if typeof columns === 'function'} -->
                {@render columns(handleSort, handleKeyDown)}
                <!-- {/if} -->
            </thead>
            {@render filters?.()}
            <tbody>
                {#each data.rows as row, index}
                    <!-- {#if typeof dataRow === 'function'} -->
                    {@render dataRow(row, index)}
                    <!-- {/if} -->
                {:else}
                    <tr><td colspan={columnLen}>
                            <div class="chip vertical">
                                <Spinner paused={data.ready} text="Loading" pausedText="No data" />
                            </div>
                        </td></tr>
                {/each}
            </tbody>
        </table>

        {#if !data.ready && data.rows.length}
            <div class="center-align" style="top: -50vh;">
                <div class="chip vertical">
                    <Spinner text="Loading" pausedIcon={null} />
                </div>
            </div>
        {/if}
    </figure>
</div>

<style>
    :global(thead th) {
        cursor: pointer;
    }
</style>
