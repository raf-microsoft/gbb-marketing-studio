import sharp from "sharp";
import fs from "fs";
import path from "path";
import { toFile } from "openai";
import { createOpenAIClient } from "../../../lib/auth";

export const config = {
    api: {
        bodyParser: { sizeLimit: "20mb" },
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const BLOB_CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;
const ASSETS_CONTAINER = process.env.AZURE_STORAGE_ASSETS_CONTAINER;

/**
 * Resizes a buffer to exactly the given "WxH" size string using sharp (cover crop).
 * Returns a new buffer (JPEG).
 */
async function resizeToExact(buffer, sizeStr) {
    const [w, h] = sizeStr.split("x").map(Number);
    if (!w || !h) return buffer;
    const resized = await sharp(buffer)
        .resize(w, h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 90 })
        .toBuffer();
    console.log(`[generate] resized image to ${w}x${h} (${resized.length} bytes)`);
    return resized;
}



/**
 * Resolves a reference image into a { buffer, filename, mime } object.
 */
async function resolveReferenceImage(referenceAssetFilename, referenceImageBlobName) {
    if (referenceAssetFilename) {
        // Fetch from assets container via backend proxy
        const blobUrl = `${BACKEND_URL}/storage/${ASSETS_CONTAINER}/${referenceAssetFilename}`;
        const response = await fetch(blobUrl);
        if (!response.ok) throw new Error(`Failed to fetch asset: ${response.status}`);

        const contentType = response.headers.get('content-type') || "image/jpeg";
        const ext = contentType.split("/")[1] ?? "jpg";
        const buffer = Buffer.from(await response.arrayBuffer());

        return {
            buffer,
            filename: `reference.${ext}`,
            mime: contentType,
        };
    } else if (referenceImageBlobName) {
        // Fetch from images container via backend proxy
        const blobUrl = `${BACKEND_URL}/storage/${BLOB_CONTAINER}/${referenceImageBlobName}`;
        const response = await fetch(blobUrl);
        if (!response.ok) throw new Error(`Failed to fetch blob: ${response.status}`);

        const contentType = response.headers.get('content-type') || "image/png";
        const ext = contentType.split("/")[1] ?? "png";
        const buffer = Buffer.from(await response.arrayBuffer());

        return {
            buffer,
            filename: `reference.${ext}`,
            mime: contentType,
        };
    }
    return null;
}



export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const {
        prompt,
        size = "1280x720",
        seconds = "4",
        referenceAssetFilename,
        referenceImageBlobName,
        remixJobId,
        guideline,
    } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const guidelineContent = (() => {
        if (!guideline || !/^[a-z0-9-]+$/.test(guideline)) return null;
        const fp = path.join(process.cwd(), "guidelines", "video", `${guideline}.md`);
        return fs.existsSync(fp) ? fs.readFileSync(fp, "utf8") : null;
    })();
    const finalPrompt = guidelineContent
        ? `${guidelineContent}\n\n---\n\nUser request: ${prompt}`
        : prompt;

    try {
        const openai = await createOpenAIClient('video');
        let video;

        if (remixJobId) {
            // Remix via dedicated backend endpoint (bypasses SDK path issues)
            const remixRes = await fetch(`${BACKEND_URL}/video/remix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: remixJobId, prompt: finalPrompt }),
            });
            const remixData = await remixRes.json();
            if (!remixRes.ok) {
                const apiErr = remixData?.error;
                const message = typeof apiErr === 'object' ? apiErr.message : (apiErr ?? remixData?.message ?? 'Remix failed');
                const code = typeof apiErr === 'object' ? apiErr.code : null;
                const err = new Error(`${remixRes.status} ${message}`);
                err.code = code;
                err.status = remixRes.status;
                throw err;
            }
            video = remixData;
        } else if (referenceAssetFilename || referenceImageBlobName) {
            // Image-to-video using SDK
            const imageRef = await resolveReferenceImage(referenceAssetFilename, referenceImageBlobName);
            if (!imageRef) {
                return res.status(400).json({ error: "No reference image found for image-to-video" });
            }
            const resizedBuffer = await resizeToExact(imageRef.buffer, size);
            console.log(`[generate] image-to-video SDK (file: ${imageRef.filename}, size: ${size}, seconds: ${seconds})`);
            video = await openai.videos.create({
                model: 'sora-2',
                prompt: finalPrompt,
                size,
                seconds: String(seconds),
                input_reference: await toFile(resizedBuffer, imageRef.filename, { type: "image/jpeg" }),
            });
        } else {
            // Text-to-video using SDK
            console.log(`[generate] text-to-video SDK (size: ${size}, seconds: ${seconds})`);
            video = await openai.videos.create({
                model: 'sora-2',
                prompt: finalPrompt,
                size,
                seconds: String(seconds),
            });
        }

        console.log(`[generate] job created: id=${video.id} status=${video.status}`);
        return res.status(200).json({ jobId: video.id, status: video.status });
    } catch (err) {
        console.error("video/generate error:", JSON.stringify({
            message: err.message,
            code: err.code,
            status: err.status,
            error: err.error,
        }, null, 2));
        const message = err.code === "moderation_blocked"
            ? "Your prompt was blocked by the content safety system. Possible reasons include human, child, alcohol, or other sensitive content.Please revise it and try again."
            : (err.message ?? "Video generation failed");
        return res.status(500).json({ error: message, code: err.code });
    }
}
