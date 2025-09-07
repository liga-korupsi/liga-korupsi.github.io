import { TursoFetcher } from "../../../lib/data/turso-fetcher.svelte";


export default function initializeInflationData() {
    const fetcher = new TursoFetcher({
        table: 'inflasi_tahunan',
        sort: 'tahun asc',
    });

    fetchList(fetcher);
    (fetcher as any).getValue = (nilai, tahun) => calculateInflationValue(fetcher, nilai, tahun);

    return fetcher as TursoFetcher & {
        getValue: (val: number, tahun: number) => number;
    }
}

async function fetchList(fetcher) {
    await fetcher.fetchList()
    fetcher.rates = [...fetcher.rows]
}

function calculateInflationValue(inflation, initial_value: number, start_year: number): number {
    let target_year = new Date().getFullYear();
    let current_value = initial_value;

    for (let year = start_year; year < target_year; year++) {
        const inflation_rate_obj = inflation.rates.find(d => +d.tahun === year);

        if (inflation_rate_obj) {
            const inflation_rate = inflation_rate_obj.inflasi_persen / 100;
            current_value *= (1 + inflation_rate);
        }
    }

    return current_value;
}
