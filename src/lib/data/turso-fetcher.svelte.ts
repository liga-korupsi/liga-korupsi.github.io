import { HttpFetcher, type HttpFetcherOptions } from "./http-fetcher.svelte.ts";

type TursoFetcherOptions = HttpFetcherOptions & { table: string }

export { TursoFetcher }
export default class TursoFetcher extends HttpFetcher {

    #table

    constructor(options: TursoFetcherOptions) {
        options.url = `${process.env.PUB_TURSO_URL}/v2/pipeline`;
        options.auth = process.env.PUB_TURSO_AUTH!
        super(options)
        this.#table = options.table
    }

    prepareRequest() {
        const sql = `SELECT * FROM ${this.#table} ORDER BY ${super.getSort().join(' ')}`;
        return [ () => ({ requests: [{ type: 'execute', stmt: { sql } }] }), sql ]
    }

    prepareRows(data) {
        data = data.results?.[0].response.result || { cols: [], rows: [] }
        const cols = Object.entries(data.cols)
        const rows = []

        for (const entry of data.rows) {
            // @ts-ignore
            rows.push(cols.reduce((row, [index, col]: any[]) => {
                row[col.name] = entry[index].value
                return row
            }, {}))
        }

        this.rows = rows
    }

    sortBy(key) {
        super.sort(key)
        this.fetch()
    }
}
