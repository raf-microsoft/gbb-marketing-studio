import { createOpenAIClient, fetchBlob } from "../../../lib/auth";
import fs from "fs";
import path from "path";

const JSON_OUTPUT_INSTRUCTION = `

## Output Format
Respond with a valid JSON object only — no markdown, no extra text:
{
  "title": "short headline/overlay text (null if not applicable for this format)",
  "body": "main ad copy text",
  "action": "CTA button/link label (null if not applicable)"
}`;

const DEFAULT_SYSTEM_PROMPT =
    "You are an expert copywriter for Zava marketing campaigns. " +
    "Write concise, compelling ad copy to appear with a short marketing video. " +
    "Max 120 words. Structure: a punchy hook line, 1-2 sentences of body copy, and a short call to action. " +
    "Use plain text only — no markdown, no hashtags, no emojis." +
    JSON_OUTPUT_INSTRUCTION;

function loadGuideline(slug) {
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
    const filePath = path.join(process.cwd(), "guidelines", "adcopy", "video", `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf8") + JSON_OUTPUT_INSTRUCTION;
}

/**
 * Fetch reference image from blob storage (assets container) or local samples
 */
async function resolveReferenceImage(referenceAssetFilename) {
    if (!referenceAssetFilename) return null;

    // Try blob storage first (via backend proxy)
    try {
        const container = process.env.AZURE_STORAGE_ASSETS_CONTAINER || 'assets';
        const { buffer, contentType } = await fetchBlob(container, referenceAssetFilename);

        console.log(`[generate-text] reference from blob: ${referenceAssetFilename} (${contentType}, ${buffer.length} bytes)`);
        return { buffer, mime: contentType };
    } catch {
        // Fall back to local samples
        try {
            const filePath = path.join(process.cwd(), "public", "samples", referenceAssetFilename);
            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(referenceAssetFilename).replace(".", "").toLowerCase();
            const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
            console.log(`[generate-text] reference from local: ${referenceAssetFilename} (${mime}, ${buffer.length} bytes)`);
            return { buffer, mime };
        } catch {
            console.warn(`[generate-text] reference image not found: ${referenceAssetFilename}`);
            return null;
        }
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { prompt, referenceAssetFilename, guideline } = req.body;
    const SYSTEM_PROMPT = loadGuideline(guideline) ?? DEFAULT_SYSTEM_PROMPT;

    if (!prompt && !referenceAssetFilename) {
        return res.status(400).json({ error: "prompt or referenceAssetFilename is required" });
    }

    try {
        const openai = await createOpenAIClient('text');

        let messages;

        if (referenceAssetFilename) {
            // Use the reference image for visual copy generation
            const imageRef = await resolveReferenceImage(referenceAssetFilename);
            if (!imageRef) {
                return res.status(400).json({ error: "Reference image not found" });
            }

            const dataUrl = `data:${imageRef.mime};base64,${imageRef.buffer.toString("base64")}`;

            messages = [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: dataUrl } },
                        {
                            type: "text",
                            text: prompt
                                ? `Write ad copy for this Zava marketing video. The video was created using this prompt: "${prompt}".`
                                : "Write ad copy for this Zava marketing video.",
                        },
                    ],
                },
            ];
        } else {
            messages = [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Write ad copy for a Zava marketing video described as: "${prompt}".`,
                },
            ];
        }

        const response = await openai.chat.completions.create({
            messages,
            max_completion_tokens: 500,
            response_format: { type: "json_object" },
        });

        const text = response.choices[0]?.message?.content || "";

        return res.status(200).json({ text });
    } catch (err) {
        console.error("video/generate-text error:", err);
        return res.status(500).json({ error: err.message || "Text generation failed" });
    }
}
