#!/usr/bin/env node
/**
 * Quick smoke test for image and video generation via backend proxy.
 * Run: node test.js
 * Requires: backend running on http://localhost:4000
 */

const BACKEND = 'http://localhost:4000';

async function testHealth() {
    const r = await fetch(`${BACKEND}/health`);
    const j = await r.json();
    console.log('✅ Health:', j.status ?? j);
}

async function testImageGeneration() {
    console.log('\n--- Image Generation (no references) ---');
    const r = await fetch(`${BACKEND}/image/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: 'A simple red square on white background',
            n: 1,
            size: '1024x1024',
            quality: 'low',
            output_format: 'png',
        }),
    });
    const j = await r.json();
    if (!r.ok) {
        console.error('❌ Image generation FAILED:', JSON.stringify(j, null, 2));
    } else {
        const item = j.data?.[0];
        console.log('✅ Image generation OK:', item?.url ? `url=${item.url.slice(0, 60)}...` : 'b64_json present');
    }
}

async function testVideoGeneration() {
    console.log('\n--- Video Generation (text-to-video) ---');
    // SDK maps openai.videos.create() → POST /videos (NOT /videos/generations)
    const r = await fetch(`${BACKEND}/video/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'sora-2',   // backend strips this before forwarding to Azure
            prompt: 'A calm ocean wave',
            n_seconds: 5,
            height: 480,
            width: 854,
            n_variants: 1,
        }),
    });
    const j = await r.json();
    if (!r.ok) {
        console.error('❌ Video generation FAILED:', JSON.stringify(j, null, 2));
    } else {
        console.log('✅ Video generation OK - job id:', j.id ?? JSON.stringify(j).slice(0, 120));
    }
}

async function main() {
    try {
        await testHealth();
        await testImageGeneration();
        await testVideoGeneration();
    } catch (err) {
        console.error('Test error:', err.message);
        process.exit(1);
    }
}

main();
