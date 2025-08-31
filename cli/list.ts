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

        const data = await response.json();

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

function printTable(title: string, result: any) {
    if (result && result.cols && result.rows) {
        const columns: string[] = result.cols.map((col: { name: string; }) => col.name);
        const rows: any[] = result.rows.map((row: any[]) => {
            const obj: Record<string, any> = {};
            columns.forEach((colName, index) => {
                obj[colName] = row[index]?.value;
            });
            return obj;
        });

        console.log(title);
        console.table(rows);
    } else {
        console.log("No data found.");
    }
}

async function getListKasus(): Promise<void> {
    const sql = "SELECT * FROM kasus ORDER BY nilai DESC";
    const result = await executeQuery(sql);
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

// Main logic
const args = process.argv.slice(2); // Assuming 'bun cli list <entity>'
const entity = args[0];

if (!entity) {
    console.error("Usage: bun cli list <entity>");
    console.error("Entities: kasus, pihak, berita");
    process.exit(1);
}

if (entity === 'kasus') {
    getListKasus();
} else if (entity === 'pihak') {
    getListPihak();
} else if (entity === 'berita') {
    getListBerita();
} else {
    console.error(`Unknown entity for list command: ${entity}`);
    process.exit(1);
}