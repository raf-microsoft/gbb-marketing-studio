import { toFile } from "openai";
import { createOpenAIClient } from "../../../lib/auth";

export const config = {
    api: {
        bodyParser: { sizeLimit: "20mb" },
        responseLimit: "30mb",
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { imageUrl, blobName, prompt, size, format, quality, background, maskDataUrl } = req.body;

    if ((!imageUrl && !blobName) || !prompt) {
        return res.status(400).json({ error: "imageUrl or blobName, and prompt are required" });
    }

    try {
        let buffer, contentType;

        // Get the image buffer
        if (blobName) {
            const blobUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
            const blobResp = await fetch(blobUrl);
            if (!blobResp.ok) {
                throw new Error(`Failed to fetch blob: ${blobResp.status}`);
            }
            contentType = blobResp.headers.get("content-type") || "image/png";
            buffer = Buffer.from(await blobResp.arrayBuffer());
        } else if (imageUrl.startsWith("data:")) {
            const [meta, b64] = imageUrl.split(",");
            contentType = meta.match(/:(.*?);/)?.[1] ?? "image/png";
            buffer = Buffer.from(b64, "base64");
        } else {
            const resp = await fetch(imageUrl);
            if (!resp.ok) throw new Error(`Failed to fetch source image: ${resp.status}`);
            contentType = resp.headers.get("content-type") ?? "image/png";
            buffer = Buffer.from(await resp.arrayBuffer());
        }

        const ext = contentType.split("/")[1] ?? "png";
        const imageFile = await toFile(buffer, `image.${ext}`, { type: contentType });

        const openai = await createOpenAIClient('image');

        const editParams = {
            image: imageFile,
            prompt,
            n: 1,
            size: size || "1024x1024",
            quality: quality?.toLowerCase() || "high",
            output_format: format || "png",
            background: background?.toLowerCase() || "auto",
        };

        // Add mask if provided
        if (maskDataUrl) {
            const [, b64] = maskDataUrl.split(",");
            const maskBuffer = Buffer.from(b64, "base64");
            editParams.mask = await toFile(maskBuffer, "mask.png", { type: "image/png" });
        }

        console.log('Image edit request:', { size: editParams.size, hasPrompt: !!prompt, hasMask: !!maskDataUrl });

        const result = await openai.images.edit(editParams);

        const item = result.data[0];
        const resultUrl = item.b64_json
            ? `data:image/${format || "png"};base64,${item.b64_json}`
            : item.url;

        return res.status(200).json({ url: resultUrl });
    } catch (err) {
        console.error("refine-image error:", JSON.stringify({
            message: err.message,
            code: err.code,
            type: err.type,
            status: err.status,
            error: err.error,
            requestID: err.requestID,
        }, null, 2));

        const code = err.code ?? null;
        const message = code === "moderation_blocked"
            ? "Your prompt or image was blocked by the content safety system. Possible reasons include child, alcohol, or other sensitive content. Please revise your prompt and try again."
            : (err.message ?? "Refinement failed");
        return res.status(500).json({ error: message, code });
    }
}
