import { HttpFetcher, type HttpFetcherOptions } from "./http-fetcher.svelte";

interface TursoFetcherOptions extends HttpFetcherOptions {
    table: string;
}

export { TursoFetcher }
export default class TursoFetcher extends HttpFetcher {

    #table: string

    constructor(options: TursoFetcherOptions) {
        options.url = `${process.env.PUB_TURSO_URL}/v2/pipeline`;
        options.auth = process.env.PUB_TURSO_AUTH!
        options.method = 'POST';
        super(options)
        this.#table = options.table
    }

    prepareFetchOne(id: string | number) {
        return this.prepareSql(`SELECT * FROM ${this.#table} WHERE id = ${id} LIMIT 1`);
    }

    prepareFetchList() {
        const [sortKey, sortOrder] = super.getSort();
        return this.prepareSql(`SELECT * FROM ${this.#table} ORDER BY ${sortKey} ${sortOrder}`);
    }

    prepareSql(sql: string): [string, () => any, Record<string, any>] {
        const getBody = () => ({ requests: [{ type: 'execute', stmt: { sql } }] });
        return [sql, getBody, {}];
    }

    prepareRows(data: any) {
        const result = data.results?.[0]?.response?.result || { cols: [], rows: [] };
        const cols = result.cols || [];
        const rowsData = result.rows || [];
        const rows: any[] = [];

        for (const entry of rowsData) {
            const row: Record<string, any> = {};
            cols.forEach((col: { name: string }, index: number) => {
                row[col.name] = entry[index]?.value;
            });
            rows.push(row);
        }

        this.rows = rows;
    }

    

    sortBy(key: string) {
        super.sort(key)
        super.fetchList()
    }
}
