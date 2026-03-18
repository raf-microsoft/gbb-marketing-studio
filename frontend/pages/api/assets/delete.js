const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_ASSETS_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { blobName } = req.body;
    if (!blobName) return res.status(400).json({ error: "Missing blobName" });

    try {
        // Delete blob via APIM proxy
        const deleteUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
        const response = await fetch(deleteUrl, { method: 'DELETE' });

        if (!response.ok) {
            console.error(`APIM delete failed: ${response.status} ${response.statusText}`);
            return res.status(500).json({ error: `Delete failed: ${response.statusText}` });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("asset delete error:", err);
        return res.status(500).json({ error: err.message });
    }
}
