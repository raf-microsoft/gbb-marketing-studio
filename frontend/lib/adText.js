// Formats that display a dedicated title slot + action button in their ad template
const TITLE_FORMATS = new Set([
    // image
    "facebook-ad", "banner", "thumbnail", "rebrand", "custom",
    // video
    "facebook-reel", "instagram-story", "youtube-short", "tiktok",
]);

export function hasTitle(guideline) {
    return TITLE_FORMATS.has(guideline);
}

/**
 * Parse adText which may be:
 * - A JSON string: { title, body, action }  (new format)
 * - A plain text string                      (legacy, backwards-compat)
 */
export function parseAdText(adText) {
    if (!adText) return null;
    try {
        const parsed = JSON.parse(adText);
        if (parsed && typeof parsed === "object" && (parsed.body || parsed.title)) {
            return {
                title: parsed.title || null,
                body: parsed.body || "",
                action: parsed.action || "Shop Now",
            };
        }
    } catch { }
    // Backwards compat: plain text string — treat as body
    return { title: null, body: adText, action: "Shop Now" };
}

export function serializeAdText({ title, body, action }) {
    return JSON.stringify({ title: title || null, body: body || "", action: action || null });
}
