import express from 'express';
import { getOpenAIToken } from '../utils/auth.js';

const router = express.Router();

export function createVideoRouter(config) {
    const { openaiEndpoint, videoDeployment } = config;

    // ─── Dedicated remix endpoint ─────────────────────────────────────────────
    router.post('/remix', async (req, res) => {
        const { videoId, prompt } = req.body;
        if (!videoId || !prompt) {
            return res.status(400).json({ error: 'videoId and prompt are required' });
        }
        try {
            const token = await getOpenAIToken();
            const isOpenAICompatible = openaiEndpoint.includes('/openai/v1');
            const url = isOpenAICompatible
                ? `${openaiEndpoint}/videos/${videoId}/remix`
                : `${openaiEndpoint}/openai/deployments/${videoDeployment}/videos/generations/${videoId}/remix?api-version=2024-12-17-preview`;

            console.log(`🎬 Remix ${videoId} → ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Remix API error:', JSON.stringify(data));
            }
            return res.status(response.status).json(data);
        } catch (error) {
            console.error('Remix error:', error);
            return res.status(500).json({ error: 'Remix failed', message: error.message });
        }
    });

    // Don't use middleware here - let server.js handle JSON/multipart parsing
    // For JSON: server.js express.json() parses it
    // For multipart: SDK sends it, we forward it as-is
    router.all('/*', async (req, res) => {
        try {
            const token = await getOpenAIToken();
            const sdkPath = req.path;
            const isOpenAICompatible = openaiEndpoint.includes('/openai/v1');

            let url;
            if (isOpenAICompatible) {
                url = `${openaiEndpoint}${sdkPath}`;
            } else {
                const apiVersion = '2024-12-17-preview';
                let azurePath;
                if (sdkPath.includes('/generations')) {
                    azurePath = `/openai/deployments/${videoDeployment}/videos/generations`;
                } else if (sdkPath.includes('/status')) {
                    azurePath = `/openai/deployments/${videoDeployment}/videos/status`;
                } else {
                    azurePath = `/openai/deployments/${videoDeployment}${sdkPath}`;
                }
                url = `${openaiEndpoint}${azurePath}?api-version=${apiVersion}`;
            }

            console.log(`🎥 ${req.method} ${sdkPath} → ${url}`);

            let body;
            let contentTypeHeader = req.headers['content-type'] || 'application/json';

            if (req.method !== 'GET' && req.method !== 'HEAD') {
                if (Buffer.isBuffer(req.body)) {
                    body = req.body;
                } else if (typeof req.body === 'object') {
                    const bodyObj = { ...req.body };
                    // Only POST /videos (create) accepts model; remix and other sub-paths do not
                    const isCreateEndpoint = sdkPath === '/videos' || sdkPath === '/videos/';
                    if (isOpenAICompatible && isCreateEndpoint) {
                        if (!bodyObj.model) bodyObj.model = videoDeployment;
                    } else {
                        delete bodyObj.model;
                    }
                    body = JSON.stringify(bodyObj);
                    contentTypeHeader = 'application/json';
                } else {
                    body = req.body;
                }
            }

            // Set up headers for Azure OpenAI request
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': contentTypeHeader,
                ...(req.headers['accept'] && { 'Accept': req.headers['accept'] })
            };

            const response = await fetch(url, {
                method: req.method,
                headers,
                body
            });

            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                const data = await response.json();
                res.status(response.status).json(data);
            } else {
                const buffer = await response.arrayBuffer();
                res.status(response.status)
                    .set('Content-Type', contentType)
                    .send(Buffer.from(buffer));
            }
        } catch (error) {
            console.error('Video proxy error:', error);
            res.status(500).json({ error: 'Video proxy failed', message: error.message });
        }
    });

    return router;
}
