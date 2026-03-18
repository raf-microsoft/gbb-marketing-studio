export const config = {
    api: {
        bodyParser: {
            sizeLimit: "30mb",
        },
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { dataUrl, projectId, generationId, index } = req.body;

    if (!dataUrl || !projectId || !generationId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Parse data URL: data:image/png;base64,<data>
        const [meta, base64] = dataUrl.split(",");
        const contentType = meta.match(/:(.*?);/)?.[1] ?? "image/png";
        const ext = contentType.split("/")[1] ?? "png";
        const buffer = Buffer.from(base64, "base64");

        const blobName = `${projectId}/${generationId}/${index ?? 0}.${ext}`;

        // Upload via backend proxy
        const uploadUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
        console.log('Uploading image to:', uploadUrl);
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'x-ms-blob-type': 'BlockBlob',
            },
            body: buffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Upload failed: ${response.status} ${response.statusText}`, errorText);
            return res.status(500).json({ error: `Upload failed: ${response.statusText}` });
        }

        const url = `/api/blob?name=${encodeURIComponent(blobName)}`;
        return res.status(200).json({ url, blobName });
    } catch (err) {
        console.error("upload-image error:", err);
        return res.status(500).json({ error: err.message ?? "Upload failed" });
    }
}
