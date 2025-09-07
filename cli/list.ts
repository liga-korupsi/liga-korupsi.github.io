import { executeQuery, printTable } from './db';

async function getListKasus(name?: string): Promise<void> {
    let sql = "SELECT * FROM kasus";
    const args: Array<{ type: string; value: any }> = [];
    if (name) {
        sql += " WHERE kasus LIKE ?";
        args.push({ type: "text", value: `%${name}%` });
    }
    sql += " ORDER BY nilai DESC";
    const result = await executeQuery(sql, args);
    printTable("Klasemen Liga Korupsi Indonesia:", result);
}

async function getListPihak(): Promise<void> {
    const sql = "SELECT * FROM pihak_terlibat";
    const result = await executeQuery(sql);
    printTable("Daftar Pihak Terlibat:", result);
}

async function getListBerita(): Promise<void> {
    const sql = "SELECT * FROM berita";
    const result = await executeQuery(sql);
    printTable("Daftar Berita:", result);
}


async function getListKasusTimeline(kasus_id: number): Promise<void> {
    const sql = "SELECT * FROM kasus_timeline WHERE kasus_id = ? ORDER BY tanggal";
    const args = [{ type: "integer", value: kasus_id.toString() }];
    const result = await executeQuery(sql, args);
    printTable(`Timeline for Kasus ID: ${kasus_id}`, result);
}

async function getListPihakTimeline(pihak_id: number): Promise<void> {
    const sql = "SELECT * FROM pihak_terlibat_timeline WHERE pihak_id = ? ORDER BY tanggal";
    const args = [{ type: "integer", value: pihak_id.toString() }];
    const result = await executeQuery(sql, args);
    printTable(`Timeline for Pihak ID: ${pihak_id}`, result);
}

async function getListBeritaByKasusId(kasus_id: number): Promise<void> {
    const sql = "SELECT * FROM berita WHERE kasus_id = ?";
    const args = [{ type: "integer", value: kasus_id.toString() }];
    const result = await executeQuery(sql, args);
    printTable(`Berita for Kasus ID: ${kasus_id}`, result);
}

// Main logic
const args = process.argv.slice(2); // Assuming 'bun cli list <entity> [id]'
const entity = args[0];

if (!entity) {
    console.error("Usage: bun cli list <entity> [id]");
    console.error("Entities: kasus, pihak, berita, kasus_timeline, pihak_timeline, berita_kasus");
    process.exit(1);
}

if (entity === 'kasus') {
    if (args.length > 1) { // Check if a name is provided
        getListKasus(args[1]);
    } else {
        getListKasus();
    }
} else if (entity === 'pihak') {
    getListPihak();
} else if (entity === 'berita') {
    getListBerita();
} else if (entity === 'kasus_timeline') {
    if (args.length < 2) {
        console.error("Usage: bun cli list kasus_timeline <kasus_id>");
        process.exit(1);
    }
    const kasus_id = parseInt(args[1], 10);
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    getListKasusTimeline(kasus_id);
} else if (entity === 'pihak_timeline') {
    if (args.length < 2) {
        console.error("Usage: bun cli list pihak_timeline <pihak_id>");
        process.exit(1);
    }
    const pihak_id = parseInt(args[1], 10);
    if (isNaN(pihak_id)) { console.error("Error: 'pihak_id' must be a number."); process.exit(1); }
    getListPihakTimeline(pihak_id);
} else if (entity === 'berita_kasus') {
    if (args.length < 2) {
        console.error("Usage: bun cli list berita_kasus <kasus_id>");
        process.exit(1);
    }
    const kasus_id = parseInt(args[1], 10);
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    getListBeritaByKasusId(kasus_id);
} else {
    console.error(`Unknown entity for list command: ${entity}`);
    process.exit(1);
}
