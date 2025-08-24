export interface KasusDetail {
    id: number;
    title: string;
    tahun: string;
    nilai_kerugian: number;
    link?: string;
    daerah?: string;
    people: Person[];
    case_timeline: CaseEvent[];
}

export interface Person {
    nama: string;
    jabatan: string;
    timeline: PersonEvent[];
}

export interface PersonEvent {
    tanggal: string;
    status: string;
}

export interface CaseEvent {
    tanggal: string;
    deskripsi: string;
}