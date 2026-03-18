const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { blobNames } = req.body;
    if (!Array.isArray(blobNames) || blobNames.length === 0) {
        return res.status(400).json({ error: "blobNames array is required" });
    }

    try {
        // Delete blobs via APIM proxy
        const results = await Promise.allSettled(
            blobNames.map(async (name) => {
                const deleteUrl = `${BACKEND_URL}/storage/${CONTAINER}/${name}`;
                const response = await fetch(deleteUrl, { method: 'DELETE' });
                if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`);
            })
        );

        const failed = results
            .map((r, i) => r.status === "rejected" ? blobNames[i] : null)
            .filter(Boolean);

        return res.status(200).json({ deleted: blobNames.length - failed.length, failed });
    } catch (err) {
        console.error("delete-blobs error:", err);
        return res.status(500).json({ error: err.message ?? "Delete failed" });
    }
}
