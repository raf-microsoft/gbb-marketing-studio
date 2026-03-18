import { useState } from "react";
import {
    Tabs,
    Text,
    TextField,
    Select,
    Button,
    Flex,
    ScrollArea,
    Badge,
} from "@radix-ui/themes";
import { IconLayoutGrid, IconLayoutList, IconArrowsMaximize, IconPhotoX, IconClipboard } from "@tabler/icons-react";
import ExpandPromptDialog from "@/components/dialogs/ExpandPromptDialog";
import { toast } from "react-toastify";
import useVideoStore, { DEFAULT_SETTINGS } from "@/store/useVideoStore";
import useMarketingStudioStore from "@/store/useMarketingStudioStore";
import useSamples from "@/hooks/useSamples";
import useLightbox from "@/hooks/useLightbox";
import VideoAssetPicker from "@/components/VideoAssetPicker";
import AssetDropZone from "@/components/AssetDropZone";
import PreviewGuidelineDialog from "@/components/dialogs/PreviewGuidelineDialog";
import useClipboardUpload from "@/hooks/useClipboardUpload";

const GUIDELINE_LABELS = {
    "facebook-reel": "Facebook Reel",
    "youtube-short": "YouTube Short",
    "tiktok": "TikTok",
    "banner": "Banner",
    "custom": "Custom",
};

export default function VideoAside({ projectId, onGenerationAdded }) {
    const { projects, updateProjectSettings, addGeneration } = useVideoStore();
    const { assetView, setAssetView } = useMarketingStudioStore();
    const project = projects.find((p) => p.id === projectId) ?? { ...DEFAULT_SETTINGS, name: "" };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);
    const [assetSearch, setAssetSearch] = useState("");

    const set = (field, value) => updateProjectSettings(projectId, { [field]: value });

    const { samples, loading: samplesLoading, refresh } = useSamples();
    const { pasting, pasteFromClipboard, handlePromptPaste } = useClipboardUpload(refresh);

    const filteredSamples = assetSearch.trim()
        ? samples.filter((s) => {
            const q = assetSearch.toLowerCase();
            const name = s.filename.replace(/^\d+-/, "").toLowerCase();
            const ts = parseInt(s.filename, 10);
            const dateStr = ts ? new Date(ts).toLocaleDateString() : "";
            return name.includes(q) || dateStr.includes(q);
        })
        : samples;

    const { open: openLightbox, containerRef: lightboxRef, galleryName } = useLightbox(
        samples.map((a) => a.src),
        "video-assets"
    );

    const handleGenerate = async () => {
        if (!project.prompt?.trim()) {
            toast.error("Please enter a prompt.");
            return;
        }
        setIsSubmitting(true);
        try {
            const body = {
                prompt: project.prompt,
                model: project.model,
                guideline: project.guideline,
                size: project.size,
                seconds: project.seconds,
            };

            if (project.selectedAsset) {
                body.referenceAssetFilename = project.selectedAsset;
            }

            const res = await fetch("/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");

            const genId = addGeneration(projectId, {
                jobId: data.jobId,
                status: data.status,
                prompt: project.prompt,
                size: project.size,
                seconds: project.seconds,
                referenceAssetFilename: project.selectedAsset ?? null,
            });

            onGenerationAdded?.();
            toast.success("Video job started! It will take 1–5 minutes to complete.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <aside className="w-[280px] min-[1640px]:w-[340px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
                <Flex direction="column" gap="4" p="4" className="flex-1 overflow-y-auto">

                    {/* Name */}
                    <Flex direction="column" gap="1">
                        <Text size="1" weight="medium" color="gray">Name</Text>
                        <TextField.Root
                            size="2"
                            value={project.name}
                            onChange={(e) => set("name", e.target.value)}
                        />
                    </Flex>

                    {/* Guideline */}
                    <Flex direction="column" gap="1">
                        <Text size="1" weight="medium" color="gray">Guideline</Text>
                        <Select.Root value={project.guideline} onValueChange={(v) => set("guideline", v)} size="2">
                            <Select.Trigger className="w-full" />
                            <Select.Content>
                                <Select.Item value="facebook-reel">Facebook Reel</Select.Item>
                                <Select.Item value="youtube-short">YouTube Short</Select.Item>
                                <Select.Item value="tiktok">TikTok</Select.Item>
                                <Select.Item value="banner">Banner</Select.Item>
                                <Select.Item value="custom">Custom</Select.Item>
                            </Select.Content>
                        </Select.Root>
                        <PreviewGuidelineDialog
                            type="video"
                            slug={project.guideline}
                            label={GUIDELINE_LABELS[project.guideline] ?? project.guideline}
                        />
                    </Flex>

                    {/* Assets — selecting one activates image-to-video; filtered by current size */}
                    <Flex direction="column" gap="2">
                        <Flex align="center" justify="between">
                            <Text size="1" weight="medium" color="gray">Assets</Text>
                            <Flex gap="1" align="center">
                                <IconClipboard
                                    size={16}
                                    style={{ cursor: pasting ? "default" : "pointer", color: pasting ? "var(--accent-9)" : "var(--gray-9)" }}
                                    title="Paste from clipboard"
                                    onClick={pasteFromClipboard}
                                />
                                {project.selectedAsset && (
                                    <IconPhotoX
                                        size={16}
                                        style={{ cursor: "pointer", color: "var(--gray-9)" }}
                                        title="Clear selection"
                                        onClick={() => set("selectedAsset", null)}
                                    />
                                )}
                                <IconLayoutGrid
                                    size={16}
                                    style={{ cursor: "pointer", color: assetView === "grid" ? "var(--accent-9)" : "var(--gray-9)" }}
                                    onClick={() => setAssetView("grid")}
                                />
                                <IconLayoutList
                                    size={16}
                                    style={{ cursor: "pointer", color: assetView === "list" ? "var(--accent-9)" : "var(--gray-9)" }}
                                    onClick={() => setAssetView("list")}
                                />
                            </Flex>
                        </Flex>
                        <AssetDropZone onUploaded={refresh} />
                        <TextField.Root
                            size="2"
                            placeholder="Search by name or date…"
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                        />
                        <ScrollArea style={{ maxHeight: "50vh" }} scrollbars="vertical">
                            <VideoAssetPicker
                                size={project.size}
                                samples={filteredSamples}
                                samplesLoading={samplesLoading}
                                selectedAsset={project.selectedAsset}
                                view={assetView}
                                onSelect={(filename) => {
                                    set("selectedAsset", filename);
                                }}
                                onPreview={openLightbox}
                                onDelete={async (id) => {
                                    await fetch("/api/assets/delete", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ blobName: id }),
                                    });
                                    refresh();
                                }}
                            />
                        </ScrollArea>
                    </Flex>

                    {/* Prompt / Settings tabs */}
                    <Tabs.Root defaultValue="prompt" className="flex flex-col flex-1">
                        <Tabs.List>
                            <Tabs.Trigger value="prompt">Prompt</Tabs.Trigger>
                            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="prompt" className="pt-2 flex-1">
                            <div style={{ position: "relative" }}>
                                <textarea
                                    className="w-full h-36 text-sm p-2 border border-gray-200 rounded resize-none focus:outline-none focus:border-gray-400"
                                    placeholder="Describe the video you want to generate…"
                                    value={project.prompt ?? ""}
                                    onChange={(e) => set("prompt", e.target.value)}
                                    onPaste={handlePromptPaste}
                                />
                                <button
                                    type="button"
                                    title="Expand prompt editor"
                                    onClick={() => setPromptDialogOpen(true)}
                                    style={{ position: "absolute", bottom: 12, right: 6, background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--gray-8)", lineHeight: 0 }}
                                >
                                    <IconArrowsMaximize size={14} />
                                </button>
                            </div>
                        </Tabs.Content>
                        <Tabs.Content value="settings" className="pt-2">
                            <Flex direction="column" gap="3">
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Size</Text>
                                    <Select.Root value={project.size} onValueChange={(v) => set("size", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="720x1280">720×1280 Portrait</Select.Item>
                                            <Select.Item value="1280x720">1280×720 Landscape</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Duration</Text>
                                    <Select.Root value={project.seconds} onValueChange={(v) => set("seconds", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="4">4 seconds</Select.Item>
                                            <Select.Item value="8">8 seconds</Select.Item>
                                            <Select.Item value="12">12 seconds</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                            </Flex>
                        </Tabs.Content>
                    </Tabs.Root>
                </Flex>

                {/* Footer */}
                <Flex className="border-t border-gray-200 p-3 shrink-0" justify="between" align="center" gap="2">
                    <Select.Root value={project.model} onValueChange={(v) => set("model", v)} size="2">
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="sora-2">Sora 2</Select.Item>
                        </Select.Content>
                    </Select.Root>
                    <Button
                        className="flex-1 cursor-pointer"
                        onClick={handleGenerate}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? "Starting…" : "Generate"}
                    </Button>
                </Flex>
            </aside>
            <ExpandPromptDialog
                open={promptDialogOpen}
                onOpenChange={setPromptDialogOpen}
                value={project.prompt ?? ""}
                onInsert={(text) => set("prompt", text)}
            />

            <div ref={lightboxRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}>
                {samples.map((a) => (
                    <a key={a.id} href={a.src} data-fslightbox={galleryName} data-caption={a.filename.replace(/^\d+-/, "")} />
                ))}
            </div>
        </>
    );
}
