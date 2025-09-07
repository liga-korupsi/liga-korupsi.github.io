export type PageStateOptions = {
    current?: number;
    limit?: number;
};

export class PageState {
    current: number;
    limit: number;

    #offset: number;
    #total_count: number;
    #total_page: number;

    constructor(get_total_count: () => number, options: PageStateOptions = {}) {
        this.current = $state(options.current || 1);
        this.limit = $state(options.limit || 30);

        this.#offset = $derived((this.current - 1) * this.limit);
        this.#total_count = $derived(get_total_count());
        this.#total_page = $derived(Math.ceil(this.total_count / this.limit) || 1);
    }

    public get offset(): number {
        return this.#offset;
    }

    public get total_count(): number {
        return this.#total_count;
    }

    public get total_page(): number {
        return this.#total_page;
    }

    public get has_next(): boolean {
        return this.current < this.total_page;
    }
}
