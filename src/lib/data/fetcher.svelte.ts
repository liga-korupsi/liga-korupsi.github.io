import { type PageStateOptions } from "./page-state.svelte";
import createSort from "./sort.svelte";

export type FetcherOptions = {
    sort?: string;
    page?: PageStateOptions
}

export { Fetcher as default }

type Sorter = {
    (state: string): Fetcher;
    order: string;
    by: string;
}

export class Fetcher {

    rows = $state<any[]>([])
    ready = $state(false)
    #sort

    constructor(options: FetcherOptions = {}) {
        this.#sort = createSort(this)
        options.sort && this.#sort(options.sort)
    }

    public get sort(): Sorter {
        return this.#sort
    }

    fetch(...args: any[]): Promise<any> {
        throw new Error('fetch() method not implemented')
    }

    fetchList(...args: any[]): Promise<any> {
        throw new Error('fetchList() method not implemented')
    }
}
