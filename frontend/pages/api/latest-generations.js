const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        // List blobs via backend proxy (uses Entra ID auth)
        const response = await fetch(`${BACKEND_URL}/storage/${CONTAINER}?restype=container&comp=list`);

        if (!response.ok) {
            console.error(`Backend request failed: ${response.status} ${response.statusText}`);
            return res.status(200).json({ images: [] });
        }

        const xmlText = await response.text();

        // Parse XML to extract blob names and lastModified dates
        const blobMatches = [...xmlText.matchAll(/<Blob>[\s\S]*?<\/Blob>/g)];
        const blobs = blobMatches
            .map(match => {
                const blobXml = match[0];
                const nameMatch = blobXml.match(/<Name>(.*?)<\/Name>/);
                const lastModifiedMatch = blobXml.match(/<Last-Modified>(.*?)<\/Last-Modified>/);

                if (nameMatch && /\.(jpe?g|png|webp)$/i.test(nameMatch[1])) {
                    return {
                        name: nameMatch[1],
                        lastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]) : new Date(0),
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Sort newest first, take top 5
        blobs.sort((a, b) => b.lastModified - a.lastModified);
        const latest = blobs.slice(0, 5).map((b) => ({
            url: `/api/blob?name=${encodeURIComponent(b.name)}`,
        }));

        return res.status(200).json({ images: latest });
    } catch (err) {
        console.error("latest-generations error:", err);
        return res.status(200).json({ images: [] });
    }
}
