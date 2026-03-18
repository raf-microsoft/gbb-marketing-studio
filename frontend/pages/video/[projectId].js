import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import VideoAside from "@/components/VideoAside";
import RemixVideoDialog from "@/components/dialogs/RemixVideoDialog";
import RefineVideoTextDialog from "@/components/dialogs/RefineVideoTextDialog";
import FacebookReel from "@/components/ads/video/FacebookReel";
import YouTubeShort from "@/components/ads/video/YouTubeShort";
import TikTokAd from "@/components/ads/video/TikTokAd";
import DefaultAd from "@/components/ads/video/DefaultAd";
import { Flex, Text, Button } from "@radix-ui/themes";
import { IconVideo, IconTrash, IconRepeat, IconPencil, IconInfoCircle } from "@tabler/icons-react";
import useVideoStore from "@/store/useVideoStore";
import { toast } from "react-toastify";
import GenerationInfoDialog from "@/components/dialogs/GenerationInfoDialog";
import useSamples from "@/hooks/useSamples";

const POLL_INTERVAL = 10000; // 10 seconds

export default function VideoProjectPage() {
    const router = useRouter();
    const { projectId } = router.query;

    const { projects, updateGeneration, deleteGeneration } = useVideoStore();
    const project = projects.find((p) => p.id === projectId);
    const { samples } = useSamples();

    // Remix dialog state
    const [remixDialog, setRemixDialog] = useState({ open: false, gen: null, prompt: "", loading: false, error: null });
    // Text refine dialog state
    const [textDialog, setTextDialog] = useState(null); // { gen, text }
    // Info dialog state
    const [infoDialog, setInfoDialog] = useState(null); // gen

    // Polling ref
    const pollRef = useRef(null);
    // Track in-flight text generation to avoid duplicate calls
    const generatingText = useRef(new Set());

    // ─── Save refined text ─────────────────────────────────────────────────────
    const handleSaveText = () => {
        if (!textDialog) return;
        updateGeneration(projectId, textDialog.gen.id, { adText: textDialog.text });
        setTextDialog(null);
        toast.success("Ad text updated.");
    };

    // ─── Ad text generation ──────────────────────────────────────────────────────
    const triggerTextGen = (gen) => {
        if (generatingText.current.has(gen.id)) return;
        generatingText.current.add(gen.id);
        fetch("/api/video/generate-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: gen.prompt,
                referenceAssetFilename: gen.referenceAssetFilename ?? null,
                guideline: project?.guideline ?? null,
            }),
        })
            .then((r) => r.json())
            .then(({ text }) => {
                if (text) updateGeneration(projectId, gen.id, { adText: text });
            })
            .catch(console.error)
            .finally(() => generatingText.current.delete(gen.id));
    };

    // Trigger text gen for completed gens that have no adText on mount / when gens change
    useEffect(() => {
        if (!project) return;
        project.generations
            .filter((g) => g.status === "completed" && g.url && !g.adText)
            .forEach(triggerTextGen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.generations]);

    // ─── Polling ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!projectId) return;

        const poll = async () => {
            // Always read fresh state from store to avoid stale closure
            const { projects: freshProjects, updateGeneration: upd } = useVideoStore.getState();
            const freshProject = freshProjects.find((p) => p.id === projectId);
            if (!freshProject) return;

            const pending = freshProject.generations.filter(
                (g) => g.status === "queued" || g.status === "in_progress"
            );

            for (const gen of pending) {
                try {
                    const res = await fetch(`/api/video/status?jobId=${gen.jobId}`);
                    if (!res.ok) continue;
                    const data = await res.json();

                    if (data.status === "completed") {
                        // Download and save to blob
                        const saveRes = await fetch("/api/video/save", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ jobId: gen.jobId, projectId, generationId: gen.id }),
                        });
                        if (saveRes.ok) {
                            const saved = await saveRes.json();
                            upd(projectId, gen.id, {
                                status: "completed",
                                url: saved.url,
                                blobName: saved.blobName,
                            });
                            toast.success("Video ready!");
                            // Trigger ad text generation for the newly completed video
                            triggerTextGen({ ...gen, url: saved.url });
                        } else {
                            upd(projectId, gen.id, { status: "failed" });
                        }
                    } else if (data.status === "failed") {
                        upd(projectId, gen.id, { status: "failed" });
                        const reason = data.failureReason;
                        toast.error(reason ? `Video generation failed: ${reason}` : "Video generation failed.");
                    } else {
                        // Update status (queued → in_progress etc.)
                        upd(projectId, gen.id, { status: data.status });
                    }
                } catch (err) {
                    console.error("Poll error for job", gen.jobId, err);
                }
            }
        };

        pollRef.current = setInterval(poll, POLL_INTERVAL);
        poll(); // immediate first check

        return () => clearInterval(pollRef.current);
    }, [projectId]);

    // ─── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async (gen) => {
        deleteGeneration(projectId, gen.id);
        toast.info("Deleting…");
        try {
            await fetch("/api/video/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: gen.jobId, blobName: gen.blobName }),
            });
        } catch (err) {
            console.error("Delete error", err);
        }
    };

    // ─── Remix ───────────────────────────────────────────────────────────────────
    const handleRemix = async () => {
        const { gen, prompt } = remixDialog;
        if (!prompt.trim()) return;
        setRemixDialog((d) => ({ ...d, loading: true }));
        try {
            const res = await fetch("/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    size: gen.size || "1280x720",
                    seconds: gen.seconds || "4",
                    type: "remix",
                    remixJobId: gen.jobId,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            const { addGeneration } = useVideoStore.getState();
            addGeneration(projectId, {
                jobId: data.jobId,
                status: data.status,
                prompt: prompt.trim(),
                size: gen.size,
                seconds: gen.seconds,
                url: null,
                blobName: null,
            });

            toast.info("Remix job started! It will take 1–5 minutes.");
            setRemixDialog({ open: false, gen: null, prompt: "", loading: false });
        } catch (err) {
            const isExpired = err.message?.includes("404") || err.message?.includes("Item not found");
            if (isExpired) {
                toast.error("Remix unavailable — generation jobs expire after 24 hours. Only recently generated videos can be remixed.");
                setRemixDialog({ open: false, gen: null, prompt: "", loading: false, error: null });
            } else {
                toast.error("Remix failed: " + err.message);
                setRemixDialog((d) => ({ ...d, loading: false, error: null }));
            }
        }
    };

    // ─── Guards ───────────────────────────────────────────────────────────────────
    if (!projectId) return null;
    if (!project) {
        return (
            <Layout>
                <Flex align="center" justify="center" className="h-full w-full">
                    <Text color="gray">Project not found.</Text>
                </Flex>
            </Layout>
        );
    }

    return (
        <Layout aside={<VideoAside projectId={projectId} onGenerationAdded={() => { }} />}>
            <Flex direction="column" align="center" className="h-full w-full overflow-auto project-grid-background">
                {project.generations.length === 0 ? (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        gap="3"
                        className="h-full"
                    >
                        <IconVideo size={48} style={{ color: "var(--gray-6)" }} />
                        <Text color="gray">No generations yet. Use the sidebar to create one.</Text>
                    </Flex>
                ) : (
                    <Flex
                        direction={project.guideline === "banner" || project.guideline === "custom" ? "column" : "row"}
                        gap="8"
                        p="6"
                        align={project.guideline === "banner" || project.guideline === "custom" ? "center" : "center"}
                        className={project.guideline === "banner" || project.guideline === "custom" ? "w-full" : "w-full h-full overflow-x-auto overflow-y-hidden"}
                    >
                        {project.generations.map((gen) => {
                            const AdComponent = project.guideline === "facebook-reel" ? FacebookReel : project.guideline === "youtube-short" ? YouTubeShort : project.guideline === "tiktok" ? TikTokAd : DefaultAd;
                            const isCompleted = gen.status === "completed";
                            return (
                                <Flex key={gen.id} direction="column" gap="2" style={{ minWidth: "fit-content" }}>
                                    <Text size="1" color="gray">
                                        {new Date(gen.createdAt).toLocaleString()}
                                    </Text>
                                    <AdComponent gen={gen} />
                                    <Flex gap="2" justify="between">
                                        <Flex gap="2">
                                            <Button
                                                size="1"
                                                variant="soft"
                                                onClick={() => handleDelete(gen)}
                                            >
                                                <IconTrash size={13} />
                                                Delete
                                            </Button>
                                            <Button
                                                size="1"
                                                variant="soft"
                                                color="gray"
                                                onClick={() => setInfoDialog(gen)}
                                            >
                                                <IconInfoCircle size={13} />
                                                Info
                                            </Button>
                                        </Flex>
                                        {isCompleted && (
                                            <Flex gap="2">
                                                <Button
                                                    size="1"
                                                    variant="soft"
                                                    color="gray"
                                                    onClick={() => setTextDialog({ gen, text: gen.adText ?? "" })}
                                                >
                                                    <IconPencil size={13} />
                                                    Refine Text
                                                </Button>
                                                <Button
                                                    size="1"
                                                    variant="soft"
                                                    color="gray"
                                                    onClick={() =>
                                                        setRemixDialog({
                                                            open: true,
                                                            gen,
                                                            prompt: gen.prompt || "",
                                                            loading: false,
                                                            error: null,
                                                        })
                                                    }
                                                >
                                                    <IconRepeat size={13} />
                                                    Remix
                                                </Button>
                                            </Flex>
                                        )}
                                    </Flex>
                                </Flex>
                            );
                        })}
                    </Flex>
                )}
            </Flex>

            <GenerationInfoDialog
                open={infoDialog !== null}
                onOpenChange={(open) => !open && setInfoDialog(null)}
                gen={infoDialog}
                samples={samples}
            />

            <RemixVideoDialog
                open={remixDialog.open}
                onOpenChange={(open) => setRemixDialog((d) => ({ ...d, open }))}
                prompt={remixDialog.prompt}
                onPromptChange={(prompt) => setRemixDialog((d) => ({ ...d, prompt }))}
                onConfirm={handleRemix}
                loading={remixDialog.loading}
                error={remixDialog.error}
            />

            <RefineVideoTextDialog
                open={textDialog !== null}
                onOpenChange={(open) => !open && setTextDialog(null)}
                text={textDialog?.text ?? ""}
                onTextChange={(val) => setTextDialog((prev) => prev ? { ...prev, text: val } : null)}
                onSave={handleSaveText}
                gen={textDialog?.gen}
                guideline={project?.guideline}
            />
        </Layout>
    );
}
