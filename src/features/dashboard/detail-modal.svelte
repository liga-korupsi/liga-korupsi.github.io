<script>
  import { updateDialog } from 'beercss/src/cdn/elements/dialogs.ts';
  import { CaseDetailFetcher } from './kasus/detail-kasus.fetcher.svelte';
  import Spinner from '../../lib/ui/spinner.svelte';

  let { case_id } = $props();

  let case_detail = $state(null);
  const case_fetcher = new CaseDetailFetcher('kasus');

  let dialog_element;

  $effect(() => {
    if (case_id) {
      case_detail = null;
      case_fetcher.fetch(case_id).then(data => {
        case_detail = data;
      });
    }
  });

  export function open(src_element) {
    if (src_element && dialog_element) {
      updateDialog(src_element, dialog_element);
    }
  }

  export function close() {
    updateDialog(dialog_element, dialog_element);
  }
</script>

<style>
</style>

<dialog id="detail-modal-dialog" bind:this={dialog_element} class="large round surface-container-highest large-padding">
  <nav class="right-align">
    <button class="border transparent circle" onclick={() => close()}>
      <i>close</i>
    </button>
  </nav>

  {#if !case_fetcher.ready}
    <Spinner />
  {:else if case_detail}
    <h5 class="margin-bottom-large">{case_detail.title}</h5>
    <div class="margin-bottom-large">
      <strong>Link Berita:</strong>
      {#if case_detail.berita_list && case_detail.berita_list.length > 0}
        <ul>
          {#each case_detail.berita_list as berita_item}
            <li>
              <a href={berita_item.url} target="_blank" class="link">
                <i class="small">link</i>&nbsp;{berita_item.judul}
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p>Tidak ada link berita.</p>
      {/if}
    </div>
    <div>
      <strong>Orang yang Terlibat:</strong>
      <ul>
        {#each case_detail.people as person}
          <li>{person.nama} {#if person.jabatan}({person.jabatan}){:else}{/if}</li>
        {/each}
      </ul>
    </div>
    <div>
      <strong>Timeline Orang:</strong>
      <ul>
        {#each case_detail.people as person}
          <li>
            <strong>{person.nama}:</strong>
            <ul>
              {#each person.timeline as event}
                <li>{event.tanggal}: {event.status}</li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    </div>
    <div>
      <strong>Timeline Kasus:</strong>
      <ul>
        {#each case_detail.case_timeline as event}
          <li>{event.tanggal}: {event.deskripsi}</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p>Gagal memuat data atau data tidak ditemukan.</p>
  {/if}
</dialog>