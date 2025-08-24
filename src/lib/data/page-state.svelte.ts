export type PageStateOptions = {
    current?: number;
    limit?: number;
};

export class PageState {
    current: number;
    limit: number;

    // Properti privat untuk menampung hasil $derived
    #offset_derived: number;
    #total_count_derived: number;
    #total_page_derived: number;

    constructor(get_total_count: () => number, options: PageStateOptions = {}) {
        this.current = $state(options.current || 1);
        this.limit = $state(options.limit || 30);

        this.#offset_derived = $derived((this.current - 1) * this.limit);
        this.#total_count_derived = $derived(get_total_count());
        this.#total_page_derived = $derived(Math.ceil(this.total_count / this.limit) || 1);
    }

    // Getter publik untuk properti readonly
    public get offset(): number {
        return this.#offset_derived;
    }

    public get total_count(): number {
        return this.#total_count_derived;
    }

    public get total_page(): number {
        return this.#total_page_derived;
    }

    public get has_next(): boolean {
        return this.current < this.total_page;
    }
}