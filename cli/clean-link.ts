// This CLI tool attempts to "clean" a given URL.
// For Vertex AI redirect links, this tool will attempt to follow the redirect
// using `fetch` and extract the 'Location' header.
// This operation requires network access and will be executed in your environment.

const args = process.argv.slice(2);

if (args.length < 1) {
    console.error("Usage: bun cli/index.ts clean-link <url>");
    process.exit(1);
}

const input_url = args[0];

async function cleanLink(url: string): Promise<string> {
    if (url.includes("vertexaisearch.cloud.google.com/grounding-api-redirect/")) {
        console.log("Attempting to resolve Vertex AI redirect link using fetch...");
        try {
            const response = await fetch(url, { redirect: 'manual' });
            if (response.status >= 300 && response.status < 400) {
                const location_header = response.headers.get('Location');
                if (location_header) {
                    console.log("Successfully extracted redirected URL.");
                    return location_header;
                }
            }
            console.log("Warning: Could not extract original URL from Vertex AI redirect.");
            console.log("Returning the input URL as is.");
            return url;
        } catch (error) {
            console.error("Error during fetch operation:", error);
            console.log("Returning the input URL due to fetch error.");
            return url;
        }
    }
    // Add other cleaning logic here if needed in the future (e.g., removing tracking parameters)
    return url;
}

// Using an immediately invoked async function to handle the async cleanLink call
(async () => {
    const cleaned_url = await cleanLink(input_url);
    console.log("Cleaned URL:", cleaned_url);
})();
