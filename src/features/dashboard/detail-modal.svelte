<script>
  import { updatePage } from "beercss/src/cdn/elements/pages.ts";
  import { updateDialog } from "beercss/src/cdn/elements/dialogs.ts";
  import { CaseDetailFetcher } from "./kasus/detail-kasus.fetcher.svelte";
  import Spinner from "../../lib/ui/spinner.svelte";

  let { case_id } = $props();

  let case_detail = $state(null);
  const case_fetcher = new CaseDetailFetcher("kasus");

  let dialog_element;
  let page1_element;
  let page2_element;
  let selected_person = $state(null);

  $effect(() => {
    if (case_id) {
      case_detail = null;
      selected_person = null;
      case_fetcher.fetch(case_id).then((data) => {
        case_detail = data;
      });
    }
  });

  async function showPersonDetail(person) {
    selected_person = person;
    updatePage(page2_element);

    const timeline_data = await case_fetcher.fetchPersonTimeline(person.id);

    if (timeline_data) {
        selected_person.timeline = timeline_data;
    } else {
        selected_person.timeline = [];
    }
  }

  function showMainPage() {
    if (page1_element) {
      updatePage(page1_element);
    }
  }

  export function open(src_element) {
    if (src_element && dialog_element) {
      updateDialog(src_element, dialog_element);
      showMainPage();
    }
  }

  export function close() {
    updateDialog(dialog_element, dialog_element);
  }
</script>

<dialog
  id="detail-modal-dialog"
  bind:this={dialog_element}
  class="large round surface-container-highest large-padding smax"
>
  <nav class="right-align">
    <button class="border transparent circle" onclick={() => close()}>
      <i>close</i>
    </button>
  </nav>

  {#if !case_fetcher.ready}
    <Spinner />
  {:else if case_detail}
    <div>
      <div class="page active left" id="page1" bind:this={page1_element}>
        <h5 class="margin-bottom-large">{case_detail.title}</h5>
        
        <div class="margin-bottom-large">
          <strong>Orang yang Terlibat:</strong>
          <ol>
            {#each case_detail.people as person}
              <li><button class="link transparent selectable" onclick={() => showPersonDetail(person)}>
                {person.nama}
                {#if person.jabatan}({person.jabatan}){:else}{/if}
              </button></li>
            {/each}
          </ol>
        </div>
        <div class="margin-bottom-large">
          <strong>Timeline Kasus:</strong>
          <ul>
            {#each case_detail.case_timeline as event}
              <li>
                {event.tanggal}:
                {#if event.url}
                  <a href={event.url} target="_blank" class="button link transparent selectable top-margin auto-margin">
                    <i class="small">link</i>&nbsp;{event.deskripsi}
                  </a>
                {:else}
                  {event.deskripsi}
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="page right" id="page2" bind:this={page2_element}>
        {#if selected_person}
          <nav class="left-align">
            <button class="button" onclick={showMainPage}>
              <i>arrow_back</i>&nbsp;Kembali
            </button>
          </nav>
          <div class="grid right-padding large-padding">
            {#if selected_person.url_foto}
              <div class="s12 s">
                <img src={selected_person.url_foto} alt="Foto {selected_person.nama}" class="round right-margin large-margin medium-width medium-height" />
              </div>
            {/if}
            <div class="s12 m7 xxl8">
              <h5 class="margin-top-large margin-bottom-large">
                {selected_person.nama}
              </h5>
              <div>
                <strong>Jabatan:</strong>
                {selected_person.jabatan || "Tidak diketahui"}
              </div>
              <div> <!-- Timeline section -->
                <strong>Timeline:</strong>
                <ul class="no-padding left-margin top-margin">
                  {#each selected_person.timeline as event}
                    <li>
                      {event.tanggal}:<br><br>
                      {#if event.url}
                        <a href={event.url} target="_blank" class="button link transparent selectable top-margin auto-margin no-padding">
                          <i class="small">link</i>&nbsp;{event.deskripsi}
                        </a>
                      {:else}
                        {event.deskripsi}
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
            {#if selected_person.url_foto} <!-- Right Column: Photo -->
              <div class="l m m5 left-align">
                <img src={selected_person.url_foto} alt="Foto {selected_person.nama}" class="round right-margin large-margin medium-width medium-height" />
              </div>
            {/if}
          </div>
        {:else}
          <p>Pilih seseorang untuk melihat detail.</p>
        {/if}
      </div>
    </div>
  {:else}
    <p>Gagal memuat data atau data tidak ditemukan.</p>
  {/if}
</dialog>
