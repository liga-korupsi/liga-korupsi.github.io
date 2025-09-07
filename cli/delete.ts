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

async function deleteKasus(id: number): Promise<void> {
    const sql = `DELETE FROM kasus WHERE id = ?`;
    const result = await executeQuery(sql, [{ type: "integer", value: id.toString() }]);

    if (result && result.affected_row_count > 0) {
        console.log(`Successfully deleted entry with ID: ${id}. Affected rows: ${result.affected_row_count}`);
    } else {
        console.log(`No entry found with ID: ${id}. No rows affected.`);
    }
}

async function deletePihak(id: number): Promise<void> {
    const sql = `DELETE FROM pihak_terlibat WHERE id = ?`;
    const result = await executeQuery(sql, [{ type: "integer", value: id.toString() }]);

    if (result && result.affected_row_count > 0) {
        console.log(`Successfully deleted pihak_terlibat entry with ID: ${id}. Affected rows: ${result.affected_row_count}`);
    } else {
        console.log(`No pihak_terlibat entry found with ID: ${id}. No rows affected.`);
    }
}

async function deletePihakTimeline(pihak_id: number): Promise<void> {
    const sql = `DELETE FROM pihak_terlibat_timeline WHERE pihak_id = ?`;
    const result = await executeQuery(sql, [{ type: "integer", value: pihak_id.toString() }]);

    if (result && result.affected_row_count > 0) {
        console.log(`Successfully deleted timeline entries for pihak_id: ${pihak_id}. Affected rows: ${result.affected_row_count}`);
    } else {
        console.log(`No timeline entries found for pihak_id: ${pihak_id}. No rows affected.`);
    }
}

async function deletePihakTimelineEntry(timeline_id: number): Promise<void> {
    const sql = `DELETE FROM pihak_terlibat_timeline WHERE id = ?`;
    const result = await executeQuery(sql, [{ type: "integer", value: timeline_id.toString() }]);

    if (result && result.affected_row_count > 0) {
        console.log(`Successfully deleted timeline entry with ID: ${timeline_id}. Affected rows: ${result.affected_row_count}`);
    } else {
        console.log(`No timeline entry found with ID: ${timeline_id}. No rows affected.`);
    }
}

// Main logic to parse arguments
const args = process.argv.slice(2); // Assuming 'bun cli delete <entity> <id>'
const entity = args[0]; // e.g., 'kasus'

if (!entity) {
    console.error("Usage: bun cli delete <entity> <id>");
    process.exit(1);
}

if (entity === 'kasus') {
    if (args.length < 2) { // delete kasus <id>
        console.error("Usage: bun cli delete kasus <id>");
        process.exit(1);
    }
    const idToDelete = parseInt(args[1], 10);
    if (isNaN(idToDelete)) { console.error("Error: 'id' must be a number."); process.exit(1); }
    deleteKasus(idToDelete);
} else if (entity === 'pihak') { // NEW BLOCK
    if (args.length < 2) { // delete pihak <id>
        console.error("Usage: bun cli delete pihak <id>");
        process.exit(1);
    }
    const idToDelete = parseInt(args[1], 10);
    if (isNaN(idToDelete)) { console.error("Error: 'id' must be a number."); process.exit(1); }
    deletePihak(idToDelete);
} else if (entity === 'pihak_timeline') {
    if (args.length < 2) { // delete pihak_timeline <pihak_id>
        console.error("Usage: bun cli delete pihak_timeline <pihak_id>");
        process.exit(1);
    }
    const pihak_id = parseInt(args[1], 10);
    if (isNaN(pihak_id)) { console.error("Error: 'pihak_id' must be a number."); process.exit(1); }
    deletePihakTimeline(pihak_id);
} else if (entity === 'pihak_timeline_entry') {
    if (args.length < 2) { // delete pihak_timeline_entry <timeline_id>
        console.error("Usage: bun cli delete pihak_timeline_entry <timeline_id>");
        process.exit(1);
    }
    const timeline_id = parseInt(args[1], 10);
    if (isNaN(timeline_id)) { console.error("Error: 'timeline_id' must be a number."); process.exit(1); }
    deletePihakTimelineEntry(timeline_id);
} else {
    console.error(`Unknown entity for delete command: ${entity}`);
    process.exit(1);
}
