import { executeQuery } from './db';

async function updateBeritaEntry(berita_id: number, new_url: string): Promise<void> {
    const sql = `UPDATE berita SET url = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_url },
        { type: "integer", value: berita_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated berita entry with ID: ${berita_id}.`);
    } else {
        console.log(`No entry found with ID: ${berita_id}. No rows affected.`);
    }
}

async function updateBeritaJudul(berita_id: number, new_judul: string): Promise<void> {
    const sql = `UPDATE berita SET judul = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_judul },
        { type: "integer", value: berita_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated title for berita ID: ${berita_id}.`);
    } else {
        console.log(`No entry found with ID: ${berita_id}. No rows affected.`);
    }
}

async function updatePihakNama(pihak_id: number, new_nama: string): Promise<void> {
    const sql = `UPDATE pihak_terlibat SET nama = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_nama },
        { type: "integer", value: pihak_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated name for pihak_terlibat ID: ${pihak_id}.`);
    } else {
        console.log(`No entry found with ID: ${pihak_id}. No rows affected.`);
    }
}

async function updatePihakTimelineDeskripsi(timeline_id: number, new_deskripsi: string): Promise<void> {
    const sql = `UPDATE pihak_terlibat_timeline SET deskripsi = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_deskripsi },
        { type: "integer", value: timeline_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated deskripsi for pihak_terlibat_timeline ID: ${timeline_id}.`);
    } else {
        console.log(`No entry found with ID: ${timeline_id}. No rows affected.`);
    }
}

async function updatePihakTimelineUrl(timeline_id: number, new_url: string): Promise<void> {
    const sql = `UPDATE pihak_terlibat_timeline SET url = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_url },
        { type: "integer", value: timeline_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated URL for pihak_terlibat_timeline ID: ${timeline_id}.`);
    } else {
        console.log(`No entry found with ID: ${timeline_id}. No rows affected.`);
    }
}

async function updatePihakUrlFoto(pihak_id: number, new_url_foto: string): Promise<void> {
    const sql = `UPDATE pihak_terlibat SET url_foto = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_url_foto },
        { type: "integer", value: pihak_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated url_foto for pihak_terlibat ID: ${pihak_id}.`);
    } else {
        console.log(`No entry found with ID: ${pihak_id}. No rows affected.`);
    }
}

async function updateKasusName(kasus_id: number, new_name: string): Promise<void> {
    const sql = `UPDATE kasus SET kasus = ? WHERE id = ?`;
    const args = [
        { type: "text", value: new_name },
        { type: "integer", value: kasus_id.toString() }
    ];
    const result = await executeQuery(sql, args);
    if (result && result.affected_row_count > 0) {
        console.log(`Successfully updated name for kasus ID: ${kasus_id}.`);
    } else {
        console.log(`No entry found with ID: ${kasus_id}. No rows affected.`);
    }
}

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli update <entity> [args]'
const entity = args[0]; // e.g., 'berita'

if (!entity) {
    console.error("Usage: bun cli update <entity> [args]");
    console.error("Entities: berita, berita_judul");
    process.exit(1);
}

if (entity === 'berita') {
    if (args.length < 3) { // update berita <berita_id> <new_url>
        console.error("Usage: bun cli update berita <berita_id> <new_url>");
        process.exit(1);
    }
    const berita_id = parseInt(args[1], 10);
    const new_url = args[2];
    if (isNaN(berita_id)) { console.error("Error: 'berita_id' must be a number."); process.exit(1); }
    updateBeritaEntry(berita_id, new_url);
} else if (entity === 'berita_judul') {
    if (args.length < 3) { // update berita_judul <berita_id> <new_judul>
        console.error("Usage: bun cli update berita_judul <berita_id> <new_judul>");
        process.exit(1);
    }
    const berita_id = parseInt(args[1], 10);
    const new_judul = args[2];
    if (isNaN(berita_id)) { console.error("Error: 'berita_id' must be a number."); process.exit(1); }
    updateBeritaJudul(berita_id, new_judul);
} else if (entity === 'pihak_nama') {
    if (args.length < 3) { // update pihak_nama <pihak_id> <new_nama>
        console.error("Usage: bun cli update pihak_nama <pihak_id> <new_nama>");
        process.exit(1);
    }
    const pihak_id = parseInt(args[1], 10);
    const new_nama = args[2];
    if (isNaN(pihak_id)) { console.error("Error: 'pihak_id' must be a number."); process.exit(1); }
    updatePihakNama(pihak_id, new_nama);
} else if (entity === 'pihak_timeline_deskripsi') {
    if (args.length < 3) { // update pihak_timeline_deskripsi <timeline_id> <new_deskripsi>
        console.error("Usage: bun cli update pihak_timeline_deskripsi <timeline_id> <new_deskripsi>");
        process.exit(1);
    }
    const timeline_id = parseInt(args[1], 10);
    const new_deskripsi = args[2];
    if (isNaN(timeline_id)) { console.error("Error: 'timeline_id' must be a number."); process.exit(1); }
    updatePihakTimelineDeskripsi(timeline_id, new_deskripsi);
} else if (entity === 'pihak_timeline_url') {
    if (args.length < 3) { // update pihak_timeline_url <timeline_id> <new_url>
        console.error("Usage: bun cli update pihak_timeline_url <timeline_id> <new_url>");
        process.exit(1);
    }
    const timeline_id = parseInt(args[1], 10);
    const new_url = args[2];
    if (isNaN(timeline_id)) { console.error("Error: 'timeline_id' must be a number."); process.exit(1); }
    updatePihakTimelineUrl(timeline_id, new_url);
} else if (entity === 'kasus_name') {
    if (args.length < 3) { // update kasus_name <kasus_id> <new_name>
        console.error("Usage: bun cli update kasus_name <kasus_id> <new_name>");
        process.exit(1);
    }
    const kasus_id = parseInt(args[1], 10);
    const new_name = args[2];
    if (isNaN(kasus_id)) { console.error("Error: 'kasus_id' must be a number."); process.exit(1); }
    updateKasusName(kasus_id, new_name);
} else if (entity === 'pihak_url_foto') {
    if (args.length < 3) { // update pihak_url_foto <pihak_id> <new_url_foto>
        console.error("Usage: bun cli update pihak_url_foto <pihak_id> <new_url_foto>");
        process.exit(1);
    }
    const pihak_id = parseInt(args[1], 10);
    const new_url_foto = args[2];
    if (isNaN(pihak_id)) { console.error("Error: 'pihak_id' must be a number."); process.exit(1); }
    updatePihakUrlFoto(pihak_id, new_url_foto);
} else {
    console.error(`Unknown entity for update command: ${entity}`);
    process.exit(1);
}
