
export interface TursoResponse {
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

export async function executeQuery(sql: string, args?: Array<{ type: string; value: any }>): Promise<any> {
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

export function printTable(title: string, result: any) {
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
