interface TursoResponse {
    baton: any;
    base_url: any;
    results: Array<{
        type: string;
        response: {
            type: string;
            result: any;
        };
    }>;
}

async function executeQuery(sql: string, args?: Array<{ type: string; value: any }>): Promise<any> {
    const tursoUrl: string | undefined = process.env.PUB_TURSO_URL;
    const tursoAuth: string | undefined = process.env.PUB_TURSO_AUTH;

    if (!tursoUrl || !tursoAuth) {
        console.error("Error: PUB_TURSO_URL or PUB_TURSO_AUTH not found in environment variables.");
        process.exit(1);
    }

    const apiUrl: string = `${tursoUrl}/v2/pipeline`;
    const requestBody = {
        requests: [
            {
                type: "execute",
                stmt: {
                    sql: sql,
                    args: args || []
                }
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tursoAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }

        const data: TursoResponse = await response.json();

        if (data.results && data.results[0]?.response?.type === 'execute') {
            return data.results[0].response.result;
        } else {
            console.log("No data found or unexpected response format.");
            return null;
        }

    } catch (error: any) {
        console.error("Failed to fetch data:", error.message);
        process.exit(1);
    }
}

async function postKasus(kasus: string, tahun: string, nilai: number, daerah: string): Promise<void> {
    const sql = `INSERT INTO kasus (kasus, tahun, nilai, daerah) VALUES (?, ?, ?, ?)`;
    const args = [
        { type: "text", value: kasus },
        { type: "text", value: tahun },
        { type: "float", value: nilai },
        { type: "text", value: daerah }
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

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli post <entity> [args]'

if (args.length < 1) {
    console.error("Usage: bun cli post <entity> [args]");
    console.error("Entities: kasus, pihak, berita");
    process.exit(1);
}

const entity = args[0]; // e.g., 'kasus', 'pihak', 'berita'

if (entity === 'kasus') {
    if (args.length < 4) { // post kasus <kasus> <tahun> <nilai> [daerah]
        console.error("Usage: bun cli post kasus <kasus> <tahun> <nilai> [daerah]");
        process.exit(1);
    }
    const kasus = args[1];
    const tahun = args[2];
    const nilai = parseFloat(args[3]);
    const daerah = args[4] || '';
    if (isNaN(nilai)) { console.error("Error: 'nilai' must be a number."); process.exit(1); }
    postKasus(kasus, tahun, nilai, daerah);
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
} else {
    console.error(`Unknown entity for post command: ${entity}`);
    process.exit(1);
}
