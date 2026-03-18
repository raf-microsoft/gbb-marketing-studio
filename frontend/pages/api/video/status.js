import { createOpenAIClient } from "../../../lib/auth";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    try {
        const openai = await createOpenAIClient('video');
        const video = await openai.videos.retrieve(jobId);

        // Capture any failure reason the API provides
        const failureReason =
            video.error?.message ??
            video.failure_reason ??
            video.error ??
            null;

        return res.status(200).json({
            jobId: video.id,
            status: video.status, // queued | in_progress | completed | failed
            failureReason: typeof failureReason === "string" ? failureReason : null,
        });
    } catch (err) {
        console.error("video/status error:", err.message);
        return res.status(500).json({ error: err.message ?? "Status check failed" });
    }
}
