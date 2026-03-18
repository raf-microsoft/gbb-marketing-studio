import { toFile } from "openai";
import { createOpenAIClient } from "../../../lib/auth";
import fs from "fs";
import path from "path";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "30mb",
        },
        responseLimit: "30mb",
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const ASSETS_CONTAINER = process.env.AZURE_STORAGE_ASSETS_CONTAINER;

function loadGuideline(type, slug) {
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
    const filePath = path.join(process.cwd(), "guidelines", type, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf8");
}

async function loadReferenceFiles(blobNames = []) {
    const results = await Promise.all(
        blobNames.map(async (blobName) => {
            try {
                const blobUrl = `${BACKEND_URL}/storage/${ASSETS_CONTAINER}/${blobName}`;
                const response = await fetch(blobUrl);
                if (response.ok) {
                    const buffer = Buffer.from(await response.arrayBuffer());
                    const contentType = response.headers.get('content-type') || "image/png";
                    const ext = contentType.split("/")[1] ?? "png";
                    return toFile(buffer, `${blobName}.${ext}`, { type: contentType });
                }
                console.warn(`Reference image not found in storage: ${blobName}`);
                return null;
            } catch (err) {
                console.error(`Failed to load reference image ${blobName}:`, err.message);
                return null;
            }
        })
    );
    return results.filter(Boolean);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, size, format, quality, background, n, referenceImages = [], guideline, maskDataUrl } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    // Rebrand guideline requires the zava-brand asset to be attached
    if (guideline === "rebrand") {
        const hasBrandAsset = referenceImages.some((name) =>
            typeof name === "string" && name.includes("zava-brand")
        );
        if (!hasBrandAsset) {
            return res.status(400).json({
                error: "Rebrand requires the Zava brand asset. Please attach the zava-brand.png file under Assets before generating.",
            });
        }
    }

    const guidelineContent = loadGuideline("image", guideline);
    const finalPrompt = guidelineContent
        ? `${guidelineContent}\n\n---\n\nUser request: ${prompt}`
        : prompt;

    try {
        const openai = await createOpenAIClient();

        // Load reference images if provided
        const referenceFiles = await loadReferenceFiles(referenceImages);

        const commonParams = {
            prompt: finalPrompt,
            n: parseInt(n) || 1,
            size: size || "1024x1024",
            quality: quality?.toLowerCase() || "high",
            output_format: format || "png",
            background: background?.toLowerCase() || "auto",
        };

        let result;

        if (referenceFiles.length > 0) {
            // Use images.edit() when reference images are provided
            const editParams = {
                ...commonParams,
                image: referenceFiles.length === 1 ? referenceFiles[0] : referenceFiles,
            };
            if (maskDataUrl) {
                const [meta, b64] = maskDataUrl.split(",");
                const maskBuffer = Buffer.from(b64, "base64");
                editParams.mask = await toFile(maskBuffer, "mask.png", { type: "image/png" });
            }
            console.log(`Image edit with ${referenceFiles.length} reference image(s)`);
            result = await openai.images.edit(editParams);
        } else {
            console.log('Image generation (no references)');
            result = await openai.images.generate(commonParams);
        }

        const images = result.data.map((item) => {
            if (item.b64_json) {
                return { url: `data:image/${format || "png"};base64,${item.b64_json}` };
            }
            return { url: item.url };
        });

        return res.status(200).json({ images });
    } catch (err) {
        console.error("Image generation error:", err);
        return res.status(500).json({ error: err.message || "Generation failed" });
    }
}


