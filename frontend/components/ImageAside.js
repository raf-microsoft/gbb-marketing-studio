import { useState } from "react";
import {
    Tabs,
    Text,
    TextField,
    Select,
    Button,
    IconButton,
    Flex,
    ScrollArea,
} from "@radix-ui/themes";
import { IconLayoutGrid, IconLayoutList, IconArrowsMaximize, IconMaskOff, IconMask, IconPhotoX, IconClipboard } from "@tabler/icons-react";
import ExpandPromptDialog from "@/components/dialogs/ExpandPromptDialog";
import MaskEditorDialog from "@/components/dialogs/MaskEditorDialog";
import { toast } from "react-toastify";
import useImageStore, { DEFAULT_SETTINGS } from "@/store/useImageStore";
import useMarketingStudioStore from "@/store/useMarketingStudioStore";
import useSamples from "@/hooks/useSamples";
import useLightbox from "@/hooks/useLightbox";
import ImageAssetPicker from "@/components/ImageAssetPicker";
import AssetDropZone from "@/components/AssetDropZone";
import PreviewGuidelineDialog from "@/components/dialogs/PreviewGuidelineDialog";
import useClipboardUpload from "@/hooks/useClipboardUpload";

const GUIDELINE_LABELS = {
    "facebook-ad": "Facebook Ad",
    "instagram-post": "Instagram Post",
    "banner": "Banner",
    "thumbnail": "Thumbnail",
    "rebrand": "Rebrand",
    "custom": "Custom",
};

export default function ImageAside({ projectId }) {
    const { projects, isGenerating, setGenerating, setError, updateProjectSettings, addGeneration } = useImageStore();
    const { assetView, setAssetView } = useMarketingStudioStore();
    const project = projects.find((p) => p.id === projectId) ?? { ...DEFAULT_SETTINGS, name: "" };
    const [promptDialogOpen, setPromptDialogOpen] = useState(false);
    const [maskDialogOpen, setMaskDialogOpen] = useState(false);
    const [maskDataUrl, setMaskDataUrl] = useState(null);
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

    // Src of the first selected asset — used as base image for mask painting
    const maskSrc = samples.find((s) => (project.selectedAssets ?? [])[0] === s.id)?.src ?? null;

    const { open: openLightbox, containerRef: lightboxRef, galleryName } = useLightbox(
        samples.map((a) => a.src),
        "assets"
    );

    const handleGenerate = async () => {
        if (!project.prompt?.trim()) {
            toast.error("Please enter a prompt.");
            return;
        }

        const validAssets = project.selectedAssets ?? [];

        setGenerating(true);
        try {
            // 1. Generate images
            const genRes = await fetch("/api/image/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: project.prompt,
                    size: project.size,
                    format: project.format,
                    quality: project.quality,
                    background: project.background,
                    n: parseInt(project.variations) || 1,
                    referenceImages: validAssets,
                    guideline: project.guideline,
                    maskDataUrl: maskDataUrl ?? null,
                }),
            });

            const genData = await genRes.json();
            if (!genRes.ok) throw new Error(genData.error || "Generation failed");

            // 2. Upload each image to blob storage
            const generationId = crypto.randomUUID();
            const uploaded = await Promise.all(
                genData.images.map(async (img, index) => {
                    try {
                        const uploadRes = await fetch("/api/image/save", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                dataUrl: img.url,
                                projectId,
                                generationId,
                                index,
                            }),
                        });
                        const uploadData = await uploadRes.json();
                        if (!uploadRes.ok) throw new Error(uploadData.error);
                        return { url: uploadData.url, blobName: uploadData.blobName, size: project.size };
                    } catch {
                        // Fall back to the data URL if upload fails
                        return { url: img.url, size: project.size };
                    }
                })
            );

            // 3. Save generation to project store (with pre-set id so adText updates match)
            addGeneration(projectId, uploaded, {
                prompt: project.prompt,
                selectedAssets: project.selectedAssets ?? [],
            });
            toast.success("Image generated!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setGenerating(false);
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
                                <Select.Item value="facebook-ad">Facebook Ad</Select.Item>
                                <Select.Item value="instagram-post">Instagram Post</Select.Item>
                                <Select.Item value="banner">Banner</Select.Item>
                                <Select.Item value="thumbnail">Thumbnail</Select.Item>
                                <Select.Item value="rebrand">Rebrand</Select.Item>
                                <Select.Item value="custom">Custom</Select.Item>
                            </Select.Content>
                        </Select.Root>
                        <PreviewGuidelineDialog
                            type="image"
                            slug={project.guideline}
                            label={GUIDELINE_LABELS[project.guideline] ?? project.guideline}
                        />
                    </Flex>

                    {/* Assets */}
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
                                {(project.selectedAssets ?? []).length > 0 && (
                                    <IconPhotoX
                                        size={16}
                                        style={{ cursor: "pointer", color: "var(--gray-9)" }}
                                        title="Clear selection"
                                        onClick={() => set("selectedAssets", [])}
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
                            <ImageAssetPicker
                                samples={filteredSamples}
                                samplesLoading={samplesLoading}
                                selectedAssets={project.selectedAssets ?? []}
                                view={assetView}
                                onToggle={(id) => {
                                    const prev = project.selectedAssets ?? [];
                                    set("selectedAssets", prev.includes(id)
                                        ? prev.filter((x) => x !== id)
                                        : [...prev, id]
                                    );
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
                                    <IconArrowsMaximize size={18} />
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
                                            <Select.Item value="1024x1024">1024x1024</Select.Item>
                                            <Select.Item value="1024x1536">1024x1536</Select.Item>
                                            <Select.Item value="1536x1024">1536x1024</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Format</Text>
                                    <Select.Root value={project.format} onValueChange={(v) => set("format", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="png">png</Select.Item>
                                            <Select.Item value="jpeg">jpeg</Select.Item>
                                            <Select.Item value="webp">webp</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Quality</Text>
                                    <Select.Root value={project.quality} onValueChange={(v) => set("quality", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="High">High</Select.Item>
                                            <Select.Item value="Medium">Medium</Select.Item>
                                            <Select.Item value="Low">Low</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Background</Text>
                                    <Select.Root value={project.background} onValueChange={(v) => set("background", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="Auto">Auto</Select.Item>
                                            <Select.Item value="Transparent">Transparent</Select.Item>
                                            <Select.Item value="Opaque">Opaque</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" weight="medium" color="gray">Variations</Text>
                                    <Select.Root value={project.variations} onValueChange={(v) => set("variations", v)} size="2">
                                        <Select.Trigger className="w-full" />
                                        <Select.Content>
                                            <Select.Item value="1">1</Select.Item>
                                            <Select.Item value="2">2</Select.Item>
                                            <Select.Item value="3">3</Select.Item>
                                            <Select.Item value="4">4</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </Flex>
                            </Flex>
                        </Tabs.Content>
                    </Tabs.Root>
                </Flex>

                <Flex className="border-t border-gray-200 p-3 shrink-0" align="center" gap="2">
                    <Select.Root value={project.model} onValueChange={(v) => set("model", v)} size="2">
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="gpt-image-1.5">GPT Image 1.5</Select.Item>
                        </Select.Content>
                    </Select.Root>
                    <Flex align="center" gap="2" className="flex-1" justify="end">
                        {(project.selectedAssets ?? []).length === 1 && (
                            <IconButton
                                size="2"
                                variant={maskDataUrl ? "solid" : "soft"}
                                color={maskDataUrl ? "" : "gray"}
                                title={maskDataUrl ? "Edit mask" : "Paint inpaint mask"}
                                onClick={() => setMaskDialogOpen(true)}
                            >
                                <IconMask size={16} />
                            </IconButton>
                        )}
                        {maskDataUrl && (project.selectedAssets ?? []).length === 1 && (
                            <IconButton size="2" variant="ghost" color="gray" title="Remove mask" onClick={() => setMaskDataUrl(null)}>
                                <IconMaskOff size={16} />
                            </IconButton>
                        )}
                        <Button
                            className="flex-1 cursor-pointer"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            loading={isGenerating}
                        >
                            {isGenerating ? "Generating…" : "Generate"}
                        </Button>
                    </Flex>
                </Flex>
            </aside>
            <ExpandPromptDialog
                open={promptDialogOpen}
                onOpenChange={setPromptDialogOpen}
                value={project.prompt ?? ""}
                onInsert={(text) => set("prompt", text)}
            />
            <MaskEditorDialog
                open={maskDialogOpen}
                onOpenChange={setMaskDialogOpen}
                imageSrc={maskSrc}
                existingMaskDataUrl={maskDataUrl}
                onMask={setMaskDataUrl}
            />
            <div ref={lightboxRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}>
                {samples.map((a) => (
                    <a key={a.id} href={a.src} data-fslightbox={galleryName} data-caption={a.filename.replace(/^\d+-/, "")} />
                ))}
            </div>
        </>
    );
}