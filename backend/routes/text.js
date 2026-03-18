import express from 'express';
import { getOpenAIToken } from '../utils/auth.js';

const router = express.Router();

export function createTextRouter(config) {
    const { openaiEndpoint, textDeployment } = config;

    // Text/chat uses JSON, not raw/multipart - don't add express.raw() middleware here
    router.all('/*', async (req, res) => {
        try {
            const token = await getOpenAIToken();
            const sdkPath = req.path;

            // Check if using OpenAI-compatible endpoint (/openai/v1/) or Azure-native endpoint
            const isOpenAICompatible = openaiEndpoint.includes('/openai/v1');

            let url;
            let queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';

            if (isOpenAICompatible) {
                // OpenAI-compatible endpoint still needs deployment for chat completions
                // Format: /openai/deployments/{deployment}/chat/completions
                const apiVersion = queryParams.includes('api-version=') ? '' : '?api-version=2024-02-15-preview';
                url = `${openaiEndpoint.replace('/v1', '')}/deployments/${textDeployment}/chat/completions${queryParams || apiVersion}`;
            } else {
                // Azure-native endpoint: translate SDK paths to Azure format
                const apiVersion = '2024-02-15-preview';
                const azurePath = `/openai/deployments/${textDeployment}/chat/completions`;
                url = `${openaiEndpoint}${azurePath}?api-version=${apiVersion}`;
            }

            console.log(`💬 ${req.method} ${sdkPath} → ${textDeployment}`);

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(req.headers['accept'] && { 'Accept': req.headers['accept'] })
            };

            // Inject model parameter if not present in request body
            let body;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                const bodyObj = { ...req.body };
                if (!bodyObj.model) {
                    bodyObj.model = textDeployment;
                }
                body = JSON.stringify(bodyObj);
            }

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
            console.error('Text proxy error:', error);
            res.status(500).json({ error: 'Text proxy failed', message: error.message });
        }
    });

    return router;
}
