import TursoFetcher from '../../../lib/data/turso-fetcher.svelte';
import type { KasusDetail } from './detail';

export class CaseDetailFetcher {
    private tursoFetcher: TursoFetcher;
    private table: string;
    ready = $state(true);

    constructor(table: string) {
        this.table = table;
        this.tursoFetcher = new TursoFetcher({
            table: this.table,
            prepareFetch: this.prepareDetailFetch.bind(this)
        });
    }

    private prepareDetailFetch(id: number): [string, () => any, Record<string, any>] {
        const sql = `
            SELECT
                k.id,
                k.kasus,
                k.tahun,
                k.nilai,
                k.daerah,
                IFNULL(GROUP_CONCAT(kt.tanggal || '::' || kt.deskripsi), '') AS case_timeline_data,
                IFNULL(GROUP_CONCAT(pt.nama), '') AS people_data,
                IFNULL(GROUP_CONCAT(b.url || '::' || b.judul), '') AS berita_data
            FROM
                kasus AS k
            LEFT JOIN
                kasus_timeline AS kt ON k.id = kt.kasus_id
            LEFT JOIN
                pihak_terlibat AS pt ON k.id = pt.kasus_id
            LEFT JOIN
                berita AS b ON k.id = b.kasus_id
            WHERE
                k.id = ${id}
            GROUP BY
                k.id, k.kasus, k.tahun, k.nilai, k.daerah
            LIMIT 1;
        `;
        const getBody = () => ({ requests: [{ type: 'execute', stmt: { sql } }] });
        return [sql, getBody, {}];
    }

    async fetch(id: number): Promise<KasusDetail | null> {
        this.ready = false;
        try {
            const success = await this.tursoFetcher.fetchList(id);

            if (success && this.tursoFetcher.rows.length > 0) {
                const detail: any = this.tursoFetcher.rows[0];

                if (detail.case_timeline_data) {
                    detail.caseTimeline = (detail.case_timeline_data as string).split(',').map((item: string) => {
                        const [tanggal, deskripsi] = item.split('::');
                        return { tanggal, deskripsi };
                    });
                    delete detail.case_timeline_data;
                } else {
                    detail.caseTimeline = [];
                }

                if (detail.people_data) {
                    detail.people = (detail.people_data as string).split(',').map((item: string) => {
                        const [nama, jabatan] = item.split(' - ');
                        return { nama, jabatan, timeline: [] };
                    });
                    delete detail.people_data;
                } else {
                    detail.people = [];
                }

                if (detail.berita_data || '') {
                    const firstBerita = (detail.berita_data as string).split(',')[0];
                    const [url, judul] = firstBerita.split('::');
                    detail.link = url;
                    delete detail.berita_data;
                } else {
                    detail.link = undefined;
                }

                return {
                    id: detail.id as number,
                    title: detail.kasus as string,
                    tahun: detail.tahun as string,
                    nilai_kerugian: detail.nilai as number,
                    daerah: detail.daerah as string,
                    link: detail.link,
                    people: detail.people,
                    case_timeline: detail.case_timeline,
                } as KasusDetail;
            }
            return null;
        } catch (error) {
            console.error('CaseDetailFetcher fetch error:', error);
            return null;
        } finally {
            this.ready = true;
        }
    }
}
