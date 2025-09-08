import { HttpFetcher, type HttpFetcherOptions } from "./http-fetcher.svelte";


interface TursoFetcherOptions extends HttpFetcherOptions {
    table: string;
}

export { TursoFetcher }
export default class TursoFetcher extends HttpFetcher {

    #table: string
    #total_count = $state(0)

    constructor(options: TursoFetcherOptions) {
        super({
            ...options,
            method: 'POST',
            auth: process.env.PUB_TURSO_AUTH,
            url: `${process.env.PUB_TURSO_URL}/v2/pipeline`,
            getTotalCountState: () => this.#total_count,
        })
        this.#table = options.table
    }

    prepareFetchOne(id: string | number) {
        const sql = `SELECT * FROM ${this.#table} WHERE id = ? LIMIT 1`;
        const args = [{ type: 'number', value: id }];
        return this.prepareSql(sql, args);
    }

    prepareFetchList(): [string, () => any, Record<string, any>] {
        const sql = `SELECT * FROM ${this.#table} ORDER BY ${this.sort.by} ${this.sort.order} LIMIT ${this.page.limit} OFFSET ${this.page.offset}`;
        const count_sql = `SELECT COUNT(*) FROM ${this.#table}`;
        return this.prepareSql(sql, [], count_sql);
    }

    prepareSql(sql: string, args?: Array<{ type: string; value: any }>, count_sql?: string): [string, () => any, Record<string, any>] {
        const requests = [{ type: 'execute', stmt: { sql: sql, args: args || [] } }];
        if (count_sql) {
            requests.push({ type: 'execute', stmt: { sql: count_sql } });
        }
        const getBody = () => ({ requests });
        return [sql, getBody, {}];
    }

    prepareRows(data: any) {
        const result = data.results?.[0]?.response?.result || { cols: [], rows: [] };
        const cols = result.cols || [];
        const rows_data = result.rows || [];
        const rows: any[] = [];

        for (const entry of rows_data) {
            const row: Record<string, any> = {};
            cols.forEach((col: { name: string }, index: number) => {
                row[col.name] = entry[index]?.value;
            });
            rows.push(row);
        }

        this.rows = rows;
        this.#setTotalCount(data);
    }

    #setTotalCount(data: any) {
        const count = data.results?.[1]?.response?.result?.rows?.[0]?.[0]?.value;
        this.#total_count = count ? parseInt(data.results[1].response.result.rows[0][0].value, 10) : 0;
    }

    sortBy(key: string) {
        super.sort(key)
        super.fetchList()
    }

    static addSqlWhere(sql: string, filter: Record<string, any>): [string, Array<{ type: string; value: any }>] {
        let where_clause = '';
        const sql_args: Array<{ type: string; value: any }> = [];

        const conditions: string[] = [];
        for (const key in filter) {
            if (filter.hasOwnProperty(key)) {
                conditions.push(`${key} = ?`);
                sql_args.push({ type: "text", value: filter[key].toString() });
            }
        }
        if (conditions.length > 0) {
            where_clause = ` WHERE ${conditions.join(' AND ')}`;
        }
        return [`${sql}${where_clause}`, sql_args];
    }
}
