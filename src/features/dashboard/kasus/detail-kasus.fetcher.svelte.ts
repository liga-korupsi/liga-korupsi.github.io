import TursoFetcher from '../../../lib/data/turso-fetcher.svelte';
import type { KasusDetail } from './detail';

export class CaseDetailFetcher {
    private turso_fetcher: TursoFetcher;
    private person_timeline_fetcher: TursoFetcher;
    private table: string;
    ready = $state(true);

    constructor(table: string) {
        this.table = table;
        this.turso_fetcher = new TursoFetcher({
            table: this.table,
            prepareFetch: this.prepareDetailFetch.bind(this)
        });
        this.person_timeline_fetcher = new TursoFetcher({
            table: 'pihak_terlibat_timeline',
            prepareFetch: this.preparePersonTimelineFetch.bind(this)
        });
    }

    private prepareDetailFetch(id: number): [string, () => any, Record<string, any>] {
        const base_sql = `
            SELECT
                k.id,
                k.kasus,
                k.tahun,
                k.nilai,
                k.daerah,
                kt_agg.case_timeline_data,
                pt_agg.people_data,
                b_agg.berita_data
            FROM kasus AS k
            LEFT JOIN (
                SELECT kasus_id, IFNULL(GROUP_CONCAT(tanggal || '::' || deskripsi), '') AS case_timeline_data
                FROM kasus_timeline
                GROUP BY kasus_id
            ) AS kt_agg ON k.id = kt_agg.kasus_id
            LEFT JOIN (
                SELECT kasus_id, IFNULL(GROUP_CONCAT(DISTINCT pt.id || '::' || pt.nama || '::' || IFNULL(pt.url_foto, '')), '') AS people_data
                FROM pihak_terlibat AS pt
                GROUP BY kasus_id
            ) AS pt_agg ON k.id = pt_agg.kasus_id
            LEFT JOIN (
                SELECT kasus_id, IFNULL(GROUP_CONCAT(url || '::' || judul, '|||'), '') AS berita_data
                FROM berita
                GROUP BY kasus_id
            ) AS b_agg ON k.id = b_agg.kasus_id
        `;

        const [sql_with_where, sql_args] = TursoFetcher.addSqlWhere(base_sql, {'k.id': id});

        const final_sql = `${sql_with_where}
            GROUP BY k.id, k.kasus, k.tahun, k.nilai, k.daerah
            LIMIT 1;`;

        const getBody = () => ({ requests: [{ type: 'execute', stmt: { sql: final_sql, args: sql_args } }] });
        return [final_sql, getBody, {}];
    }

    async fetch(id: number): Promise<KasusDetail | null> {
        this.ready = false;
        try {
            const success = await this.turso_fetcher.fetchList(id);

            if (success && this.turso_fetcher.rows.length > 0) {
                const detail: any = this.turso_fetcher.rows[0];

                if (detail.case_timeline_data) {
                    detail.case_timeline = (detail.case_timeline_data as string).split(',').map((item: string) => {
                        const [tanggal, deskripsi] = item.split('::');
                        return { tanggal, deskripsi };
                    });
                } else {
                    detail.case_timeline = [];
                }

                if (detail.people_data) {
                    detail.people = (detail.people_data as string).split(',').map((item: string) => {
                        const [id_str, name_field, url_foto_field] = item.split('::');
                        const id = parseInt(id_str, 10);
                        let nama = name_field;
                        let jabatan = '';
                        const url_foto = url_foto_field === '' ? undefined : url_foto_field;

                        if (name_field.includes(' - ')) {
                            [nama, jabatan] = name_field.split(' - ').map(s => s.trim());
                        }

                        return { id, nama, jabatan, url_foto, timeline: [] };
                    });
                    delete detail.people_data;
                }

                if (detail.berita_data) {
                    detail.berita_list = (detail.berita_data as string).split('|||').map((item: string) => {
                        const [url, judul] = item.split('::');
                        return { url, judul };
                    });
                    delete detail.berita_data;
                } else {
                    detail.berita_list = [];
                }

                return {
                    id: detail.id as number,
                    title: detail.kasus as string,
                    tahun: detail.tahun as string,
                    nilai_kerugian: detail.nilai as number,
                    daerah: detail.daerah as string,
                    berita_list: detail.berita_list,
                    people: detail.people,
                    case_timeline: detail.case_timeline,
                } as KasusDetail;
            }

            return null;
        } finally {
            this.ready = true;
        }
    }

    private preparePersonTimelineFetch(pihak_id: number): [string, () => any, Record<string, any>] {
        const sql = `SELECT tanggal, deskripsi, url FROM pihak_terlibat_timeline WHERE pihak_id = ? ORDER BY tanggal`;
        const args = [{ type: 'text', value: pihak_id.toString() }];
        const getBody = () => ({ requests: [{ type: 'execute', stmt: { sql, args } }] });
        return [sql, getBody, {}];
    }

    async fetchPersonTimeline(pihak_id: number): Promise<Array<{ tanggal: string; deskripsi: string }> | null> {
        try {
            const success = await this.person_timeline_fetcher.fetchList(pihak_id);

            if (success && this.person_timeline_fetcher.rows.length > 0) {
                return this.person_timeline_fetcher.rows;
            }
            return [];
        } catch (error) {
            return null;
        }
    }
}
