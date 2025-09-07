import { Fetcher, type FetcherOptions } from "./fetcher.svelte";
import { PageState } from "./page-state.svelte";

function isObject(value: any): value is object {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value)
        && Object.getPrototypeOf(value) === Object.prototype;
}

type Identifier = string | number;

export type HttpFetcherOptions = FetcherOptions & {
    url?: string;
    auth?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    prepareFetch?: Function;
    params?: Record<string, any>;
    filter?: Record<string, any>;
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

    async fetchList(filter?: Record<string, any> | Identifier, ...args: any[]) {
        const options: { limit?: number, offset?: number } = {};
        const last_arg = args[args.length - 1];

        if (isObject(last_arg)) {
            Object.assign(options, args.pop());
        }

        if (options?.limit !== undefined && options?.offset !== undefined) {
            this.page.current = (options.offset / this.page.limit) + 1;
            this.page.limit = options.limit;
        }

        this.ready = false
        let request_body: BodyInit | undefined = undefined;
        let url = this.#options.url;

        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.#options.auth}`,
        };

        const [url_params, getBody, request_params] = this.#options.prepareFetch!.apply(this, [filter, ...args]);

        if (this.#options.method === 'GET') {
            const combined_params = { ...this.#options.params, ...request_params };
            const query_params = new URLSearchParams(combined_params).toString();
            url = `${this.#options.url}?${query_params}`;
        } else {
            headers['Content-Type'] = 'application/json';
            request_body = JSON.stringify(getBody());
        }

        try {
            const response = await this.#request(url!, headers, request_body)
            const totalCountHeader = response.headers.get('X-Pagination-Total-Count');
            this.#total_count_state = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;
            this.prepareRows(await response.json(), response)
            return this.ready = true
        } catch (error) {
            console.error('HttpFetcher fetch error:', error);
            this.ready = true;
            return false;
        }
    }

    async fetchOne(id: string | number) {
        const temp_fetcher = new HttpFetcher({
            url: this.#options.url,
            auth: this.#options.auth,
            method: this.#options.method,
            params: this.#options.params,
            prepareFetch: (filter: Record<string, any>) => this.prepareFetchOne(id, filter),
        });

        const success = await temp_fetcher.fetchList({ id });

        if (success && temp_fetcher.rows.length > 0) {
            return temp_fetcher.rows[0];
        }

        return null;
    }

    #request(url: string, headers: HeadersInit, body: BodyInit | undefined) {
        return fetch(url, {
            headers: headers,
            body: body,
            method: this.#options.method,
        })
    }

    prepareFetchOne(id: any, filter?: Record<string, any>): [string, () => any, Record<string, any>] {
        const params: Record<string, any> = { ...filter, id };
        const url_params = new URLSearchParams(params).toString();
        return [url_params, () => ({}), params];
    }

    prepareFetchList(filter?: Record<string, any>): [string, () => any, Record<string, any>] {
        const params: Record<string, any> = { ...filter };
        params.limit = this.page.limit;
        params.offset = this.page.offset;

        return [new URLSearchParams(params).toString(), () => ({}), params];
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