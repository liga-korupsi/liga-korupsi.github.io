<script>
    import { onMount } from 'svelte';
    import Spinner from "../spinner.svelte";

    let table
    let columnLen = $state()
    let { dataFetcher: data, buttons, columns, filters, dataRow } = $props()

    data.fetch()

    onMount(() => {
        columnLen = table.querySelectorAll('th').length
    })
</script>

<div class="table-responsive">
    {@render buttons?.()}<br />

    <figure>
        <table bind:this={table} class="stripes {data.ready || data.rows.length || 'center-align'}">
            <thead onclick={(e) => data.sortBy(e.target.dataset.key)}>
                {@render columns()}
            </thead>
            {@render filters?.()}
            <tbody>
                {#each data.rows as row, index}
                    {@render dataRow(row, index)}
                {:else}
                    <tr><td colspan={columnLen}>
                        <div class="chip vertical">
                            <Spinner paused={data.ready} text="Loading" pausedText="No data"/>
                        </div>
                    </td></tr>
                {/each}
            </tbody>
        </table>

        {#if !data.ready && data.rows.length}
            <div class="center-align" style="top: -50vh;">
                <div class="chip vertical">
                    <Spinner text="Loading"/>
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
