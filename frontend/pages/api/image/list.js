const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const response = await fetch(`${BACKEND_URL}/storage/${CONTAINER}?restype=container&comp=list`);

        if (!response.ok) {
            console.error(`Backend request failed: ${response.status} ${response.statusText}`);
            return res.status(200).json({ images: [] });
        }

        const xmlText = await response.text();
        const blobMatches = [...xmlText.matchAll(/<Blob>[\s\S]*?<\/Blob>/g)];

        const images = blobMatches
            .map(match => {
                const blobXml = match[0];
                const nameMatch = blobXml.match(/<Name>(.*?)<\/Name>/);
                const lastModifiedMatch = blobXml.match(/<Last-Modified>(.*?)<\/Last-Modified>/);
                if (!nameMatch || !/\.(jpe?g|png|webp)$/i.test(nameMatch[1])) return null;
                return {
                    name: nameMatch[1],
                    url: `/api/blob?container=${CONTAINER}&name=${encodeURIComponent(nameMatch[1])}`,
                    lastModified: lastModifiedMatch ? lastModifiedMatch[1] : null,
                };
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        return res.status(200).json({ images });
    } catch (err) {
        console.error('image/list error:', err);
        return res.status(200).json({ images: [] });
    }
}
