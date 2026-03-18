import { createOpenAIClient } from "../../../lib/auth";
import fs from "fs";
import path from "path";

const JSON_OUTPUT_INSTRUCTION = `

## Output Format
Respond with a valid JSON object only — no markdown, no extra text:
{
  "title": "short headline for the ad title/CTA footer area (null if not applicable for this format)",
  "body": "main ad copy text",
  "action": "CTA button label e.g. Shop Now, Find a Store (null if not applicable)"
}`;

const DEFAULT_INSTRUCTIONS =
    "You are an expert copywriter for Zava marketing campaigns. " +
    "Write concise, compelling ad copy to appear with a marketing image. " +
    "Max 120 words. Structure: a punchy hook line, 1-2 sentences of body copy, and a short call to action. " +
    "Use plain text only — no markdown, no hashtags, no emojis." +
    JSON_OUTPUT_INSTRUCTION;

function loadGuideline(type, slug) {
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
    const filePath = path.join(process.cwd(), "guidelines", "adcopy", type, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf8") + JSON_OUTPUT_INSTRUCTION;
}

export const config = {
    api: {
        bodyParser: { sizeLimit: "30mb" },
        responseLimit: "30mb",
    },
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const CONTAINER = process.env.AZURE_STORAGE_IMAGES_CONTAINER;

async function fetchImageAsDataUrl(url, headers = {}) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    const contentType = response.headers.get('content-type') || "image/png";
    const b64 = Buffer.from(await response.arrayBuffer()).toString("base64");
    return `data:${contentType};base64,${b64}`;
}

async function resolveImageAsDataUrl(imageUrl, blobName) {
    if (blobName) {
        const blobUrl = `${BACKEND_URL}/storage/${CONTAINER}/${blobName}`;
        return fetchImageAsDataUrl(blobUrl);
    }
    return fetchImageAsDataUrl(imageUrl);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { imageUrl, blobName, guideline } = req.body;

    if (!imageUrl && !blobName) {
        return res.status(400).json({ error: "imageUrl or blobName is required" });
    }

    try {
        const dataUrl = await resolveImageAsDataUrl(imageUrl, blobName);
        const instructions = loadGuideline("image", guideline) ?? DEFAULT_INSTRUCTIONS;

        const openai = await createOpenAIClient('text');

        const response = await openai.chat.completions.create({
            messages: [
                { role: "system", content: instructions },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: dataUrl } },
                        { type: "text", text: "Write ad copy for this Zava marketing image." },
                    ],
                },
            ],
            max_completion_tokens: 500,
            response_format: { type: "json_object" },
        });

        const text = response.choices[0]?.message?.content || "";

        return res.status(200).json({ text });
    } catch (err) {
        console.error("generate-text error:", err);
        return res.status(500).json({ error: err.message || "Text generation failed" });
    }
}
