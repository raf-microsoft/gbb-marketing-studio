import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHealthRouter } from './routes/health.js';
import { createImageRouter } from './routes/image.js';
import { createVideoRouter } from './routes/video.js';
import { createTextRouter } from './routes/text.js';
import { createStorageRouter } from './routes/storage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Azure configuration
const config = {
    openaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    storageEndpoint: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    imageDeployment: process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || 'gpt-image-1.5',
    textDeployment: process.env.AZURE_OPENAI_TEXT_DEPLOYMENT || 'gpt-5.1',
    videoDeployment: process.env.AZURE_OPENAI_VIDEO_DEPLOYMENT || 'sora-2'
};

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Parse JSON bodies first (most common)
app.use(express.json({ limit: '50mb' }));

// For video route, also accept raw multipart data (image-to-video with files)
app.use('/video', express.raw({
    type: 'multipart/form-data',
    limit: '100mb'
}));

// For binary uploads to /storage route, parse as raw buffer
app.use('/storage', express.raw({
    type: '*/*',
    limit: '300mb'
}));

// For multipart/form-data (images), parse as raw buffer
app.use('/image', express.raw({
    type: 'multipart/form-data',
    limit: '100mb'
}));

// Mount routes
app.use('/health', createHealthRouter(config));
app.use('/image', createImageRouter(config));
app.use('/video', createVideoRouter(config));
app.use('/text', createTextRouter(config));
app.use('/storage', createStorageRouter(config));

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`🔐 Using Entra ID authentication`);
    console.log(`📡 OpenAI: ${config.openaiEndpoint}`);
    console.log(`📦 Storage: ${config.storageEndpoint}`);
});
