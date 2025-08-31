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

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli update <entity> [args]'
const entity = args[0]; // e.g., 'berita'

if (!entity) {
    console.error("Usage: bun cli update <entity> [args]");
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
} else {
    console.error(`Unknown entity for update command: ${entity}`);
    process.exit(1);
}
