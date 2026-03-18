const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const CONTAINERS = [
    process.env.AZURE_STORAGE_IMAGES_CONTAINER,
    process.env.AZURE_STORAGE_VIDEOS_CONTAINER,
    process.env.AZURE_STORAGE_ASSETS_CONTAINER
];

export default async function handler(req, res) {
    const { name, container = process.env.AZURE_STORAGE_IMAGES_CONTAINER } = req.query;

    if (!CONTAINERS.includes(container)) {
        return res.status(400).json({ error: "Invalid container" });
    }

    if (!name) {
        return res.status(400).json({ error: "Missing blob name" });
    }

    try {
        // Download blob via backend proxy - forward Range header for video streaming
        const blobUrl = `${BACKEND_URL}/storage/${container}/${name}`;
        const headers = {};

        if (req.headers['range']) {
            headers['Range'] = req.headers['range'];
        }

        const response = await fetch(blobUrl, { headers });

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: "Blob not found" });
            }
            console.error(`Backend request failed: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: response.statusText });
        }

        const contentType = response.headers.get('content-type') || "image/png";
        const contentLength = response.headers.get('content-length');
        const contentRange = response.headers.get('content-range');

        // Set status (206 for partial content when range requested)
        res.status(response.status);

        res.setHeader("Content-Type", contentType);
        res.setHeader("Accept-Ranges", "bytes");

        if (contentLength) {
            res.setHeader("Content-Length", contentLength);
        }

        if (contentRange) {
            res.setHeader("Content-Range", contentRange);
        }

        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Stream the blob content to the response
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (err) {
        console.error("blob proxy error:", err);

        res.status(500).json({
            error: "Failed to fetch blob",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}
