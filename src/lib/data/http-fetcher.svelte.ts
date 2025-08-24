import { Fetcher, type FetcherOptions } from "./fetcher.svelte";
import { PageState } from "./page-state.svelte";

function isObject(value: any): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

export type HttpFetcherOptions = FetcherOptions & {
    url?: string;
    auth?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    prepareFetch?: Function;
    params?: Record<string, any>;
}

export class HttpFetcher extends Fetcher {
    #cache: Record<string, any> = {}
    #options: HttpFetcherOptions
    #total_count_state = $state(0)
    page: PageState;

    constructor(options: HttpFetcherOptions) {
        super(options)
        this.#options = {
            method: 'GET',
            prepareFetch: this.prepareFetchList,
            ...options,
        }
        this.page = new PageState(() => this.#total_count_state, options.page)
    }

    sortBy(key: string) {
        super.sort(key)
        this.fetchList()
    }

    async fetchList(...args: any[]) {
        let options: { limit?: number, offset?: number } | undefined;
        const lastArg = args[args.length - 1];

        if (isObject(lastArg)) {
            options = args.pop();
        }

        if (options?.limit !== undefined && options?.offset !== undefined) {
            this.page.current = (options.offset / this.page.limit) + 1;
            this.page.limit = options.limit;
        }

        this.ready = false
        let requestBody: BodyInit | undefined = undefined;
        let url = this.#options.url;
        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.#options.auth}`,
        };

        const [urlParamsString, getBody, requestParams] = this.#options.prepareFetch!.apply(this, args);

        if (this.#options.method === 'GET') {
            const combinedParams = { ...this.#options.params, ...requestParams };
            const queryParams = new URLSearchParams(combinedParams).toString();
            url = `${this.#options.url}?${queryParams}`;
        } else {
            headers['Content-Type'] = 'application/json';
            requestBody = JSON.stringify(getBody());
        }

        try {
            const response = await this.#request(url!, headers, requestBody)
            const totalCountHeader = response.headers.get('X-Pagination-Total-Count');
            this.#total_count_state = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;
            this.prepareRows(await response.json())
            return this.ready = true
        } catch (error) {
            console.error('HttpFetcher fetch error:', error);
            this.ready = true;
            return false;
        }
    }

    async fetchOne(id: string | number) {
        const tempFetcher = new HttpFetcher({
            url: this.#options.url,
            auth: this.#options.auth,
            method: this.#options.method,
            params: this.#options.params,
            prepareFetch: () => this.prepareFetchOne(id),
        });

        const success = await tempFetcher.fetchList();

        if (success && tempFetcher.rows.length > 0) {
            return tempFetcher.rows[0];
        }

        return null;
    }

    async #request(url: string, headers: HeadersInit, body: BodyInit | undefined) {
        return fetch(url, {
            headers: headers,
            body: body,
            method: this.#options.method,
        })
    }

    prepareFetchOne(id: any): [string, () => any, Record<string, any>] {
        return ['', () => ({}), {}];
    }

    prepareFetchList(): [string, () => any, Record<string, any>] {
        const params: Record<string, any> = {};
        params.limit = this.page.limit;
        params.offset = this.page.offset;

        const urlParamsString = new URLSearchParams(params).toString();
        return [urlParamsString, () => ({}), params];
    }

    prepareRows(data: any) {
        this.rows = data;
    }

    getPage() {
        return { page: this.page.current, limit: this.page.limit };
    }

    setPage(page: number, limit: number) {
        this.page.current = page;
        this.page.limit = limit;
    }
}

export { HttpFetcher as default }