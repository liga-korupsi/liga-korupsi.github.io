import { type PageStateOptions } from "./page-state.svelte";

export type FetcherOptions = {
    sort?: string;
    page?: PageStateOptions
}

type SortState = {
    key?: string;
    columns: Record<string, 'asc' | 'desc'>;
}

export { Fetcher as default }

export class Fetcher {

    #sort: SortState
    rows = $state<any[]>([])
    ready = $state(false)

    constructor(options: FetcherOptions = {}) {
        this.#sort = { columns: {} }
        options.sort && this.sort(options.sort)
    }

    sort(sort: string) {
        let [key, order] = sort.split(' ')
        if (this.#sort.key === key) {
            this.#sort.columns[key] = this.#sort.columns[key] === 'asc' ? 'desc' : 'asc';
        } else {
            this.#sort.columns[key] = 'asc';
            this.#sort.key = key
        }
        if (order) {
            this.#sort.columns[key] = order as 'asc' | 'desc';
        }
        else {
            order = this.#sort.columns[key]
        }
        if (!['asc', 'desc'].includes(order)) {
            order = this.#sort.columns[key] = 'asc';
        }
        return [key, order]
    }

    getSort(): [string | undefined, 'asc' | 'desc' | undefined] {
        const key = this.#sort.key
        return [key, key ? this.#sort.columns[key] : undefined]
    }

    fetch(...args: any[]): Promise<any> {
        throw new Error('fetch() method not implemented')
    }
}