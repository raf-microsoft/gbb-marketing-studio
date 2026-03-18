import express from 'express';

const router = express.Router();

export function createHealthRouter(config) {
    router.get('/', (req, res) => {
        res.json({
            status: 'ok',
            openai: config.openaiEndpoint,
            storage: config.storageEndpoint
        });
    });

    return router;
}
