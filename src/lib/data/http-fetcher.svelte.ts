import { Fetcher, type FetcherOptions } from "./fetcher.svelte.ts";

export type HttpFetcherOptions = FetcherOptions & { url: string; auth: string; }

class HttpFetcherError extends Error { }

export class HttpFetcher extends Fetcher {

    #cache = {}
    #options: HttpFetcherOptions

    constructor(options: HttpFetcherOptions) {
        super(options)
        this.#options = options
    }

    sortBy(key) {
        super.sort(key)
        this.fetch()
    }

    async fetch() {
        const [createBody, cache_key] = this.prepareRequest()

        if (this.#cache[cache_key]) {
            this.rows = this.#cache[cache_key!]
            return
        }

        this.ready = false
        const response = await this.#request(createBody())
        this.prepareRows(await response.json())
        cache_key && (this.#cache[cache_key] = this.rows)
        return this.ready = true
    }

    async #request(body) {
        return fetch(this.#options.url, {
            headers: {
                'Authorization': `Bearer ${this.#options.auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            method: 'POST',
        })
    }

    prepareRequest(): any[] {
        throw new HttpFetcherError('prepareRequestBody() is not implemented')
    }

    prepareRows(data) {
        throw new HttpFetcherError('prepareRows() is not implemented')
    }
}

export { HttpFetcher as default }