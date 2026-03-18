import express from 'express';
import { getOpenAIToken } from '../utils/auth.js';

const router = express.Router();

export function createImageRouter(config) {
    const { openaiEndpoint, imageDeployment } = config;

    router.all('/*', async (req, res) => {
        try {
            const token = await getOpenAIToken();
            const sdkPath = req.path;
            const isOpenAICompatible = openaiEndpoint.includes('/openai/v1');
            const deploymentBase = openaiEndpoint.replace(/\/v1\/?$/, '');
            const apiVersion = '2025-04-01-preview';

            let url;
            if (sdkPath.includes('/edits')) {
                url = `${deploymentBase}/deployments/${imageDeployment}/images/edits?api-version=${apiVersion}`;
            } else if (isOpenAICompatible) {
                url = `${openaiEndpoint}${sdkPath}`;
            } else {
                if (sdkPath.includes('/generations')) {
                    url = `${deploymentBase}/deployments/${imageDeployment}/images/generations?api-version=${apiVersion}`;
                } else {
                    url = `${deploymentBase}/deployments/${imageDeployment}${sdkPath}?api-version=${apiVersion}`;
                }
            }

            console.log(`🖼️  ${req.method} ${sdkPath} → ${url}`);

            let body;
            const requestContentType = req.headers['content-type'] || '';

            if (req.method !== 'GET' && req.method !== 'HEAD') {
                if (requestContentType.includes('application/json')) {
                    const bodyObj = { ...req.body };
                    if (isOpenAICompatible && !bodyObj.model) {
                        bodyObj.model = imageDeployment;
                    }
                    body = JSON.stringify(bodyObj);
                } else if (Buffer.isBuffer(req.body)) {
                    body = req.body;
                } else {
                    body = req.body;
                }
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
                ...(req.headers['accept'] && { 'Accept': req.headers['accept'] })
            };

            const response = await fetch(url, {
                method: req.method,
                headers,
                body: body
            });

            const responseContentType = response.headers.get('content-type');

            if (responseContentType?.includes('application/json')) {
                const data = await response.json();
                res.status(response.status).json(data);
            } else {
                const buffer = await response.arrayBuffer();
                res.status(response.status)
                    .set('Content-Type', responseContentType)
                    .send(Buffer.from(buffer));
            }
        } catch (error) {
            console.error('Image proxy error:', error);
            res.status(500).json({ error: 'Image proxy failed', message: error.message });
        }
    });

    return router;
}
