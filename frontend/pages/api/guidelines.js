import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, slug } = req.query;

    if (!type || !slug) {
        return res.status(400).json({ error: "type and slug are required" });
    }

    // Sanitise inputs — only allow lowercase letters, digits and hyphens
    if (!/^[a-z0-9-]+$/.test(type) || !/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({ error: "Invalid type or slug" });
    }

    // Support ?section=adcopy to preview adcopy guidelines instead of generation guidelines
    const section = req.query.section; // optional: "adcopy"
    const filePath = section === "adcopy"
        ? path.join(process.cwd(), "guidelines", "adcopy", type, `${slug}.md`)
        : path.join(process.cwd(), "guidelines", type, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Guideline not found" });
    }

    const content = fs.readFileSync(filePath, "utf8");
    return res.status(200).json({ content });
}
