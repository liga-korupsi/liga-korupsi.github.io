<script>
    import GridView from "../../lib/ui/grid-view/grid-view.svelte";
    import DataFetcher from "../../lib/data/turso-fetcher.svelte.ts";

    const dataFetcher = new DataFetcher({
        table: 'kasus',
        sort: 'nilai desc',
    })
</script>

<div class="medium no-padding left-align">
    <div class="padding">
        <h6>Klasemen Liga Korupsi Indonesia</h6>
        <div class="s12 m12 l6" id="table-stripes">
            <GridView {dataFetcher} columnLen="4">
                {#snippet columns()}
                    <tr>
                        <th>#</th>
                        <th data-key="kasus">Kasus</th>
                        <th data-key="tahun">Tahun</th>
                        <th data-key="nilai" class="right-align">Nilai Kerugian (Rp)</th>
                    </tr>
                {/snippet}
                {#snippet dataRow(row, i)}
                    <tr>
                        <td>{i + 1}</td>
                        <td>{row.kasus}</td>
                        <td>{row.tahun}</td>
                        <td class="right-align">
                            {row.nilai && (row.nilai < 1 ? (row.nilai * 1000) + ' Miliar' : row.nilai + ' Triliun')}
                        </td>
                    </tr>
                {/snippet}
            </GridView>
        </div>
    </div>
</div>