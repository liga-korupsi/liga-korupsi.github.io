import { executeQuery } from "./db";

// Function to calculate inflation value, ported from inflation-calculator.ts
function calculateInflationValue(inflationRates: Array<{ tahun: number; inflasi_persen: number }>, initialValue: number | null, startYear: number): number | null {
    if (initialValue === null) {
        return null;
    }

    const targetYear = new Date().getFullYear(); // Assuming today's year is the target year
    let currentValue = initialValue;

    for (let year = startYear; year < targetYear; year++) {
        const inflationRateObj = inflationRates.find(d => d.tahun === year);

        if (inflationRateObj) {
            const inflationRate = inflationRateObj.inflasi_persen / 100;
            currentValue *= (1 + inflationRate);
        }
        // If inflation rate for a year is not found, we assume 0% inflation for that year
        // as per the original JS logic (it just continues without applying a rate).
    }

    return currentValue;
}

async function main() {
    console.log("Starting inflation value update...");

    // Get ID from command line arguments
    const args = process.argv.slice(2);
    const targetId = args[0] ? parseInt(args[0]) : null; // Optional ID argument

    try {
        // Fetch kasus data
        console.log("Fetching 'kasus' data...");
        let kasusQuery = "SELECT id, nilai, tahun FROM kasus";
        let queryArgs: Array<{ type: string; value: any }> = [];

        if (targetId !== null) {
            kasusQuery += " WHERE id = ?";
            queryArgs.push({ type: "integer", value: targetId });
            console.log(`For ID: ${targetId}`);
        } else {
            console.log("For all records.");
        }
        kasusQuery += ";"; // Add semicolon at the end

        const kasusResult = await executeQuery(kasusQuery, queryArgs);
        const kasusData: Array<{ id: number; nilai: number | null; tahun: string }> = kasusResult.rows.map((row: any[]) => ({
            id: row[0].value,
            nilai: row[1].value !== null ? parseFloat(row[1].value) : null,
            tahun: row[2].value
        }));
        console.log(`Fetched ${kasusData.length} 'kasus' records.`);

        if (kasusData.length === 0 && targetId !== null) {
            console.log(`No record found for ID: ${targetId}. Exiting.`);
            return;
        }

        // Fetch inflasi_tahunan data
        console.log("Fetching 'inflasi_tahunan' data...");
        const inflasiResult = await executeQuery("SELECT tahun, inflasi_persen FROM inflasi_tahunan;");
        const inflasiRates: Array<{ tahun: number; inflasi_persen: number }> = inflasiResult.rows.map((row: any[]) => ({
            tahun: parseInt(row[0].value),
            inflasi_persen: parseFloat(row[1].value)
        }));
        console.log(`Fetched ${inflasiRates.length} 'inflasi_tahunan' records.`);


        const updateStatements: string[] = [];

        for (const kasus of kasusData) {
            let startYear: number;
            if (kasus.tahun.includes('-')) {
                startYear = parseInt(kasus.tahun.split('-')[0]);
            } else {
                startYear = parseInt(kasus.tahun);
            }

            const calculatedNilaiInflasi = calculateInflationValue(inflasiRates, kasus.nilai, startYear);

            if (calculatedNilaiInflasi !== null) {
                updateStatements.push(`UPDATE kasus SET nilai_inflasi = ${calculatedNilaiInflasi.toFixed(6)} WHERE id = ${kasus.id};`);
            } else {
                updateStatements.push(`UPDATE kasus SET nilai_inflasi = NULL WHERE id = ${kasus.id};`);
            }
        }

        if (updateStatements.length > 0) {
            console.log(`Generating and executing ${updateStatements.length} UPDATE statements...`);
            const fullUpdateSql = updateStatements.join(" ");
            await executeQuery(fullUpdateSql);
            console.log("Inflation values updated successfully!");
        } else {
            console.log("No records to update.");
        }

    } catch (error: any) {
        console.error("Error updating inflation values:", error.message);
        process.exit(1);
    }
}

main();