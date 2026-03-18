const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_ASSETS_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        // List blobs via APIM proxy
        const response = await fetch(`${BACKEND_URL}/storage/${CONTAINER}?restype=container&comp=list`);

        if (!response.ok) {
            console.error(`APIM request failed: ${response.status} ${response.statusText}`);
            return res.status(200).json({ samples: [] });
        }

        const xmlText = await response.text();

        // Parse XML to extract blob names
        const blobMatches = [...xmlText.matchAll(/<Blob>[\s\S]*?<\/Blob>/g)];
        const samples = blobMatches
            .map(match => {
                const blobXml = match[0];
                const nameMatch = blobXml.match(/<Name>(.*?)<\/Name>/);

                if (nameMatch && /\.(jpe?g|png|webp|gif)$/i.test(nameMatch[1])) {
                    return {
                        id: nameMatch[1],
                        src: `/api/blob?name=${encodeURIComponent(nameMatch[1])}&container=${CONTAINER}`,
                        filename: nameMatch[1],
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Sort newest first (blob names are prefixed with timestamp)
        samples.sort((a, b) => b.filename.localeCompare(a.filename));

        return res.status(200).json({ samples });
    } catch (err) {
        console.error("samples list error:", err);
        return res.status(500).json({ error: err.message, samples: [] });
    }
}
