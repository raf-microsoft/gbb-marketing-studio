const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_VIDEOS_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { jobId, projectId, generationId } = req.body;
    if (!jobId || !projectId || !generationId) {
        return res.status(400).json({ error: "jobId, projectId and generationId are required" });
    }

    try {
        // Download video content via backend proxy
        const downloadUrl = `${BACKEND_URL}/video/videos/${jobId}/content`;
        const downloadRes = await fetch(downloadUrl);

        if (!downloadRes.ok) {
            const text = await downloadRes.text();
            throw new Error(`Download failed (${downloadRes.status}): ${text}`);
        }

        const buffer = Buffer.from(await downloadRes.arrayBuffer());
        const contentType = downloadRes.headers.get("content-type") || "video/mp4";
        const ext = contentType.includes("webm") ? "webm" : "mp4";

        // Upload to blob storage via backend proxy
        const blobName = `${projectId}/${generationId}/video.${ext}`;
        const uploadUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/octet-stream',
                'x-ms-blob-type': 'BlockBlob',
                'x-ms-blob-content-type': contentType,
            },
            body: buffer,
        });

        if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error(`Blob upload failed: ${uploadRes.status}`, errorText);
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }

        const url = `/api/blob?container=${CONTAINER}&name=${encodeURIComponent(blobName)}`;
        return res.status(200).json({ url, blobName });
    } catch (err) {
        console.error("video/save error:", err.message);
        return res.status(500).json({ error: err.message ?? "Save failed" });
    }
}
