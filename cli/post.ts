import { executeQuery } from './db';

async function postKasus(kasus: string, tahun: string, nilai: number, wilayah: string): Promise<void> {
    const sql = `INSERT INTO kasus (kasus, tahun, nilai, wilayah) VALUES (?, ?, ?, ?)`;
    const args = [
        { type: "text", value: kasus },
        { type: "text", value: tahun },
        { type: "float", value: nilai },
        { type: "text", value: wilayah }
    ];
    await executeQuery(sql, args);
    console.log("Successfully posted new kasus entry.");
}

async function postPihak(nama: string, kasus_id: number): Promise<void> {
    const sql = `INSERT INTO pihak_terlibat (nama, kasus_id) VALUES (?, ?)`;
    const args = [
        { type: "text", value: nama },
        { type: "integer", value: kasus_id.toString() }
    ];
    await executeQuery(sql, args);
    console.log("Successfully added new pihak terlibat entry.");
}

async function postBerita(kasus_id: number, judul: string, url: string): Promise<void> {
    const sql = `INSERT INTO berita (kasus_id, judul, url) VALUES (?, ?, ?)`;
    const args = [
        { type: "integer", value: kasus_id.toString() },
        { type: "text", value: judul },
        { type: "text", value: url }
    ];
    await executeQuery(sql, args);
    console.log("Successfully added new berita entry.");
}

async function postKasusTimeline(kasus_id: number, tanggal: string, deskripsi: string, url: string): Promise<void> {
    const sql = `INSERT INTO kasus_timeline (kasus_id, tanggal, deskripsi, url) VALUES (?, ?, ?, ?)`;
    const args = [
        { type: "integer", value: kasus_id.toString() },
        { type: "text", value: tanggal },
        { type: "text", value: deskripsi },
        { type: "text", value: url }
    ];
    await executeQuery(sql, args);
    console.log("Successfully added new kasus timeline entry.");
}

async function postPihakTimeline(pihak_id: number, tanggal: string, deskripsi: string): Promise<void> {
    const sql = `INSERT INTO pihak_terlibat_timeline (pihak_id, tanggal, deskripsi) VALUES (?, ?, ?)`;
    const args = [
        { type: "integer", value: pihak_id.toString() },
        { type: "text", value: tanggal },
        { type: "text", value: deskripsi }
    ];
    await executeQuery(sql, args);
    console.log("Successfully added new pihak timeline entry.");
}

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli post <entity> [args]'

if (args.length < 1) {
    console.error("Usage: bun cli post <entity> [args]");
    console.error("Entities: kasus, pihak, berita, kasus_timeline, pihak_timeline");
    process.exit(1);
}

const entity = args[0]; // e.g., 'kasus', 'pihak', 'berita'

if (entity === 'kasus') {
    if (args.length < 4) { // post kasus <kasus> <tahun> <nilai> [wilayah]
        console.error("Usage: bun cli post kasus <kasus> <tahun> <nilai> [wilayah]");
        process.exit(1);
    }
    const kasus = args[1];
    const tahun = args[2];
    const nilai = parseFloat(args[3]);
    const wilayah = args[4] || '';
    if (isNaN(nilai)) { console.error("Error: 'nilai' must be a number."); process.exit(1); }
    postKasus(kasus, tahun, nilai, wilayah);
} else if (entity === 'pihak') {
    if (args.length < 3) { // post pihak <nama> <kasus_id>
        console.error("Usage: bun cli post pihak <nama> <kasus_id>");
        process.exit(1);
    }
    const nama = args[1];
    const kasus_id = parseInt(args[2], 10);
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    postPihak(nama, kasus_id);
} else if (entity === 'berita') {
    if (args.length < 4) { // post berita <kasus_id> <judul> <url>
        console.error("Usage: bun cli post berita <kasus_id> <judul> <url>");
        process.exit(1);
    }
    const kasus_id = parseInt(args[1], 10);
    const judul = args[2];
    const url = args[3];
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    postBerita(kasus_id, judul, url);
} else if (entity === 'kasus_timeline') {
    if (args.length < 5) {
        console.error("Usage: bun cli post kasus_timeline <kasus_id> <tanggal> <deskripsi> <url>");
        process.exit(1);
    }
    const kasus_id = parseInt(args[1], 10);
    const tanggal = args[2];
    const deskripsi = args[3];
    const url = args[4];
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    postKasusTimeline(kasus_id, tanggal, deskripsi, url);
} else if (entity === 'pihak_timeline') {
    if (args.length < 4) {
        console.error("Usage: bun cli post pihak_timeline <pihak_id> <tanggal> <deskripsi>");
        process.exit(1);
    }
    const pihak_id = parseInt(args[1], 10);
    const tanggal = args[2];
    const deskripsi = args[3];
    if (isNaN(pihak_id)) { console.error("Error: 'pihak_id' must be a number."); process.exit(1); }
    postPihakTimeline(pihak_id, tanggal, deskripsi);
} else {
    console.error(`Unknown entity for post command: ${entity}`);
    process.exit(1);
}