type OrderType = 'asc' | 'desc';

class SortState {
    #by: string = $state('');
    #columns = {};

    public set by(column: string) {
        if (this.#by === column) {
            this.#columns[column] = this.#columns[column] === 'asc' ? 'desc' : 'asc';
        } else {
            this.#columns[column] = 'asc';
            this.#by = column
        }
    }

    public get by(): string {
        return this.#by;
    }

    public set order(type: undefined | OrderType) {
        if (type) {
            type = type.toLowerCase() as typeof type

            if (!['asc', 'desc'].includes(type!)) {
                this.#columns[this.#by] = 'asc';
            } else {
                this.#columns[this.#by] = type
            }
        }
    }

    public get order(): OrderType {
        return this.#columns[this.#by];
    }
}

export default function createSort(fetcher) {
    const sort_state = new SortState()

    function sortFn(sort: string) {
        const [column, order] = sort.split(' ')
        sort_state.by = column
        sort_state.order = order as OrderType
        return fetcher
    }

    Object.defineProperties(sortFn, {
        by: { get: () => sort_state.by },
        order: { get: () => sort_state.order },
    })

    return sortFn
}
