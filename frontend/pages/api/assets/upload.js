export const config = {
    api: {
        bodyParser: {
            sizeLimit: "50mb",
        },
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_ASSETS_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { dataUrl, filename } = req.body;
    if (!dataUrl || !filename) return res.status(400).json({ error: "Missing dataUrl or filename" });

    try {
        const [meta, base64] = dataUrl.split(",");
        const contentType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
        const buffer = Buffer.from(base64, "base64");

        // Sanitise filename and prefix with timestamp to avoid collisions
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const blobName = `${Date.now()}-${safeName}`;

        const uploadUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
        console.log('Uploading to:', uploadUrl);

        // Upload via backend proxy
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'x-ms-blob-type': 'BlockBlob',
            },
            body: buffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Upload failed: ${response.status} ${response.statusText}`, errorText);
            return res.status(500).json({ error: `Upload failed: ${response.statusText}` });
        }

        const url = `/api/blob?name=${encodeURIComponent(blobName)}&container=${CONTAINER}`;
        return res.status(200).json({ url, blobName, filename: blobName });
    } catch (err) {
        console.error("asset upload error:", err);
        return res.status(500).json({ error: err.message ?? "Upload failed" });
    }
}
