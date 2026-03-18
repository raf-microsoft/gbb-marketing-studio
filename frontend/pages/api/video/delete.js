const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_VIDEOS_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { jobId, blobName } = req.body;

    try {
        // Delete blob if present via backend proxy
        if (blobName) {
            const deleteUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
            await fetch(deleteUrl, {
                method: 'DELETE',
            }).catch(console.error);
        }

        // Delete Azure OpenAI video job via backend proxy
        if (jobId) {
            await fetch(`${BACKEND_URL}/openai/videos/${jobId}`, {
                method: "DELETE",
            }).catch(console.error);
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("video/delete error:", err.message);
        return res.status(500).json({ error: err.message ?? "Delete failed" });
    }
}
