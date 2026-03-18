import express from 'express';
import { getStorageToken } from '../utils/auth.js';

const router = express.Router();

export function createStorageRouter(config) {
    const { storageEndpoint } = config;

    router.all('/*', async (req, res) => {
        try {
            const token = await getStorageToken();
            const path = req.path;
            const url = `${storageEndpoint}${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

            console.log(`${req.method} ${path} → Azure Storage`);

            const headers = {
                'Authorization': `Bearer ${token}`,
                'x-ms-version': '2023-11-03',
                'Content-Type': req.headers['content-type'] || 'application/octet-stream',
                ...(req.headers['accept'] && { 'Accept': req.headers['accept'] }),
                ...(req.headers['x-ms-blob-type'] && { 'x-ms-blob-type': req.headers['x-ms-blob-type'] }),
                ...(req.headers['x-ms-blob-content-type'] && { 'x-ms-blob-content-type': req.headers['x-ms-blob-content-type'] })
            };

            // Forward Range header for video streaming
            if (req.headers['range']) {
                headers['Range'] = req.headers['range'];
            }

            const response = await fetch(url, {
                method: req.method,
                headers,
                body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
            });

            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');
            const contentRange = response.headers.get('content-range');

            if (contentType?.includes('application/json') || contentType?.includes('application/xml')) {
                const text = await response.text();
                res.status(response.status)
                    .set('Content-Type', contentType)
                    .send(text);
            } else {
                const buffer = await response.arrayBuffer();

                // Set status (206 for partial content, otherwise response status)
                res.status(response.status);

                // Set headers for streaming support
                res.set('Content-Type', contentType || 'application/octet-stream');
                res.set('Accept-Ranges', 'bytes');

                if (contentLength) {
                    res.set('Content-Length', contentLength);
                }

                if (contentRange) {
                    res.set('Content-Range', contentRange);
                }

                res.send(Buffer.from(buffer));
            }
        } catch (error) {
            console.error('Storage proxy error:', error);
            res.status(500).json({ error: 'Storage proxy failed', message: error.message });
        }
    });

    return router;
}
