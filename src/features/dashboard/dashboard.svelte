<script lang="ts">
    import GridView from "../../lib/ui/grid-view/grid-view.svelte";
    import DataFetcher from "../../lib/data/turso-fetcher.svelte";
    import DetailModal from "./detail-modal.svelte";

    
    const dataFetcher = new DataFetcher({
        page: { limit: 15 },
        sort: 'nilai desc',
        table: 'kasus',
    });

    let selected_case_id = null;
    let detail_modal_instance;

    function formatNilai(value: number | null): string {
        const numeric_value = parseFloat(String(value));
        if (numeric_value === null || typeof numeric_value !== 'number' || isNaN(numeric_value)) return '';

        if (numeric_value < 0.9) {
            const miliar_formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
            const miliar_value = numeric_value * 1000;
            return `${miliar_formatter.format(miliar_value)} Miliar`;
        }
        
        const triliun_formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });
        return `${triliun_formatter.format(numeric_value)} Triliun`;
    }

    function handleRowClick(event, row) {
        selected_case_id = row.id;
        detail_modal_instance?.open(event.currentTarget);
    }
</script>

<div class="medium no-padding left-align">
    <div class="padding">
        <h6>Klasemen Liga Korupsi Indonesia</h6>
        <div class="s12 m12 l6" id="table-stripes">
            <GridView {dataFetcher}>
                {#snippet columns()}
                    <tr>
                        <th>#</th>
                        <th data-key="kasus" tabindex="0">Kasus</th>
                        <th data-key="tahun" tabindex="0">Tahun</th>
                        <th data-key="nilai" tabindex="0" class="right-align">Nilai Kerugian (Rp)</th>
                        <th data-key="nilai_inflasi" tabindex="0" class="right-align">Kerugian + Inflasi (Rp)</th>
                    </tr>
                {/snippet}
                {#snippet dataRow(row, i)}
                    <tr>
                        <td>{i + 1}</td>
                        <td>
                            <button onclick={(e) => handleRowClick(e, row)} class="link transparent selectable">
                                {row.kasus}
                            </button>
                        </td>
                        <td>{row.tahun}</td>
                        <td class="right-align">
                            {formatNilai(row.nilai)}
                        </td>
                        <td class="right-align">
                            {formatNilai(row.nilai_inflasi)}
                        </td>
                    </tr>
                {/snippet}
            </GridView>
        </div>
        <DetailModal bind:this={detail_modal_instance} case_id={selected_case_id} />
    </div>
</div>
