<script>
    import GridView from "../../lib/ui/grid-view/grid-view.svelte";
    import DataFetcher from "../../lib/data/turso-fetcher.svelte.ts";
    import DetailModal from "./detail-modal.svelte";

    const dataFetcher = new DataFetcher({
        table: 'kasus',
        sort: 'nilai desc',
    });

    let selected_case_id = null;
    let detail_modal_instance;

    function handleRowClick(event, row) {
        selected_case_id = row.id;
        detail_modal_instance?.open(event.currentTarget);
    }
</script>

<div class="medium no-padding left-align">
    <div class="padding">
        <h6>Klasemen Liga Korupsi Indonesia</h6>
        <div class="s12 m12 l6" id="table-stripes">
            <GridView {dataFetcher} columnLen="4">
                {#snippet columns()}
                    <tr>
                        <th>#</th>
                        <th>Kasus</th>
                        <th>Tahun</th>
                        <th class="right-align">Nilai Kerugian (Rp)</th>
                    </tr>
                {/snippet}
                {#snippet dataRow(row, i)}
                    <tr>
                        <td>{i + 1}</td>
                        <td>
                            <button onclick={(e) => handleRowClick(e, row)} class="link transparent">
                                {row.kasus}
                            </button>
                        </td>
                        <td>{row.tahun}</td>
                        <td class="right-align">
                            {row.nilai && (row.nilai < 1 ? (row.nilai * 1000) + ' Miliar' : row.nilai + ' Triliun')}
                        </td>
                    </tr>
                {/snippet}
            </GridView>
        </div>
        <DetailModal bind:this={detail_modal_instance} case_id={selected_case_id} />
    </div>
</div>