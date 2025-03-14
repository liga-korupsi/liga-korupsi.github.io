<script>
    const { paused, pausedIcon, pausedText, size = '', text } = $props()
</script>

{#if paused}
    {#if pausedIcon}
        {#await pausedIcon then src}
            {@html src.default}
        {/await}
    {/if}
    {pausedText}
{:else}
    {@const text = text || pausedText}
    <progress class="circle {size}"/>
    {@html text || ''}
{/if}