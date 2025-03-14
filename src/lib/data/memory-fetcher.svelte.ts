import Fetcher from "./fetcher.svelte.ts";

type MemoryFetcherOptions = {
    getRow?: (row: any) => any;
}

export default class MemoryFetcher extends Fetcher {

    #getRow

    constructor(data = [], opts: MemoryFetcherOptions = {}) {
        super()
        this.rows = data
        this.#getRow = opts.getRow || (r => r)
    }

    sortBy(key) {
        const order = super.sort(key)[1]
        this.rows.sort((a, b) => {
            let valueA = this.#getRow(a)[key]
            let valueB = this.#getRow(b)[key]
            if (typeof valueA !== 'number') valueA = String(valueA)
            if (typeof valueB !== 'number') valueB = String(valueB)
            if (valueA < valueB) return order === 'asc' ? -1 : 1
            if (valueA > valueB) return order === 'asc' ? 1 : -1
            return 0
        })
    }
}