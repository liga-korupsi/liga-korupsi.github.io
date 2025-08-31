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

        if (data.results && data.results.length > 0 && data.results[0]?.response?.type === 'execute') {
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

async function getOneKasus(id: string | number): Promise<void> {
    const sql = `SELECT * FROM kasus WHERE id = ? LIMIT 1`;
    const result = await executeQuery(sql, [{ type: "integer", value: id.toString() }]);

    if (result && result.cols && result.rows && result.rows.length > 0) {
        const columns: string[] = result.cols.map((col: { name: string; }) => col.name);
        const rows: Array<Array<{ type: string; value: any }>> = result.rows;

        const rowValues: any[] = rows[0].map(cell => {
            if (cell.type === 'text' || cell.type === 'integer' || cell.type === 'float') {
                return cell.value;
            }
            return ''; // Handle null or other types
        });

        const detail: Record<string, any> = {};
        columns.forEach((colName, index) => {
            detail[colName] = rowValues[index];
        });

        console.log("Case Detail:");
        console.log("---------------------------------");
        for (const key in detail) {
            console.log(`${key}: ${detail[key]}`);
        }
        console.log("---------------------------------");
    } else {
        console.log(`No detail found for case ID: ${id}.`);
    }
}

async function getOnePihak(id: string | number): Promise<void> {
    const sql = `SELECT * FROM pihak_terlibat WHERE id = ? LIMIT 1`;
    const result = await executeQuery(sql, [{ type: "integer", value: id.toString() }]);

    if (result && result.cols && result.rows && result.rows.length > 0) {
        const columns: string[] = result.cols.map((col: { name: string; }) => col.name);
        const rows: Array<Array<{ type: string; value: any }>> = result.rows;

        const rowValues: any[] = rows[0].map(cell => {
            if (cell.type === 'text' || cell.type === 'integer' || cell.type === 'float') {
                return cell.value;
            }
            return ''; // Handle null or other types
        });

        const detail: Record<string, any> = {};
        columns.forEach((colName, index) => {
            detail[colName] = rowValues[index];
        });

        console.log("Pihak Terlibat Detail:");
        console.log("---------------------------------");
        for (const key in detail) {
            console.log(`${key}: ${detail[key]}`);
        }
        console.log("---------------------------------");
    } else {
        console.log(`No detail found for pihak_terlibat ID: ${id}.`);
    }
}

async function getOneBerita(id: string | number): Promise<void> {
    const sql = `SELECT * FROM berita WHERE id = ? LIMIT 1`;
    const result = await executeQuery(sql, [{ type: "integer", value: id.toString() }]);

    if (result && result.cols && result.rows && result.rows.length > 0) {
        const columns: string[] = result.cols.map((col: { name: string; }) => col.name);
        const rows: Array<Array<{ type: string; value: any }>> = result.rows;

        const rowValues: any[] = rows[0].map(cell => {
            if (cell.type === 'text' || cell.type === 'integer' || cell.type === 'float') {
                return cell.value;
            }
            return ''; // Handle null or other types
        });

        const detail: Record<string, any> = {};
        columns.forEach((colName, index) => {
            detail[colName] = rowValues[index];
        });

        console.log("Berita Detail:");
        console.log("---------------------------------");
        for (const key in detail) {
            console.log(`${key}: ${detail[key]}`);
        }
        console.log("---------------------------------");
    } else {
        console.log(`No detail found for berita ID: ${id}.`);
    }
}

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli get <subcommand> [args]'

if (args.length < 2) {
    console.error("Usage: bun cli get <entity> <id>");
    console.error("Example: bun cli get kasus 123");
    process.exit(1);
}

const entity = args[0]; // e.g., 'kasus'
const actionOrId = args[1]; // e.g., an ID

if (entity === 'kasus') {
    if (!isNaN(parseInt(actionOrId, 10))) { // Check if it's a number (ID)
        getOneKasus(actionOrId);
    } else {
        console.error("Usage: bun cli get kasus <id>");
        process.exit(1);
    }
} else if (entity === 'pihak') {
    if (!isNaN(parseInt(actionOrId, 10))) { // Check if it's a number (ID)
        getOnePihak(actionOrId);
    } else {
        console.error("Usage: bun cli get pihak <id>");
        process.exit(1);
    }
} else if (entity === 'berita') {
    if (!isNaN(parseInt(actionOrId, 10))) { // Check if it's a number (ID)
        getOneBerita(actionOrId);
    } else {
        console.error("Usage: bun cli get berita <id>");
        process.exit(1);
    }
} else {
    console.error(`Unknown entity for get command: ${entity}`);
    process.exit(1);
}