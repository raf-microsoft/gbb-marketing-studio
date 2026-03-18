import OpenAI from "openai";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Returns a configured OpenAI client that proxies through our Express backend.
 * The backend handles Entra ID authentication transparently.
 * @param {string} type - The type of operation: 'image', 'video', 'text', or 'chat'
 */
export async function createOpenAIClient(type = 'image') {
    // Map type to backend route
    const routeMap = {
        'image': '/image',
        'video': '/video',
        'text': '/text',
        'chat': '/text'
    };

    const route = routeMap[type] || '/image';

    return new OpenAI({
        baseURL: `${BACKEND_URL}${route}`,
        apiKey: 'not-needed', // Backend handles auth
        dangerouslyAllowBrowser: true,
    });
}

/**
 * Fetches a blob from Azure Storage via the backend proxy.
 * @param {string} container - Container name
 * @param {string} blobName - Blob name/path
 * @returns {Promise<{buffer: Buffer, contentType: string}>} - Blob content and content type
 */
export async function fetchBlob(container, blobName) {
    const response = await fetch(`${BACKEND_URL}/storage/${container}/${blobName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    return {
        buffer: Buffer.from(arrayBuffer),
        contentType
    };
}

