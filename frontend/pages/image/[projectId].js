import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import ImageAside from "@/components/ImageAside";
import { Flex, Text, Spinner, Button } from "@radix-ui/themes";
import FacebookAd from "@/components/ads/image/FacebookAd";
import InstagramAd from "@/components/ads/image/InstagramAd";
import DefaultAd from "@/components/ads/image/DefaultAd";
import RebrandAd from "@/components/ads/image/RebrandAd";
import BannerAd from "@/components/ads/image/BannerAd";
import useImageStore from "@/store/useImageStore";
import useLightbox from "@/hooks/useLightbox";
import useSamples from "@/hooks/useSamples";
import { IconRefresh, IconPencil, IconTrash, IconPhoto, IconInfoCircle } from "@tabler/icons-react";
import { toast } from "react-toastify";
import RefineImageDialog from "@/components/dialogs/RefineImageDialog";
import RefineTextDialog from "@/components/dialogs/RefineTextDialog";
import GenerationInfoDialog from "@/components/dialogs/GenerationInfoDialog";

const AD_COMPONENTS = {
    "facebook-ad": FacebookAd,
    "instagram-post": InstagramAd,
    "rebrand": RebrandAd,
    "banner": BannerAd,
};

function AdCard({ guideline, ...props }) {
    const Component = AD_COMPONENTS[guideline] ?? DefaultAd;
    return <Component {...props} />;
}

export default function ImageProjectPage() {
    const router = useRouter();
    const { projectId } = router.query;

    const { projects, isGenerating, updateImageAdText, addGeneration, deleteGeneration, deleteImage } = useImageStore();
    const project = projects.find((p) => p.id === projectId);
    const { samples } = useSamples();

    const generatingText = useRef(new Set());
    const [refining, setRefining] = useState(false);
    const [refineImageDialog, setRefineImageDialog] = useState(null); // { gen, img, imgIndex, prompt }
    const [textDialog, setTextDialog] = useState(null); // { genId, imgIndex, text }
    const [infoDialog, setInfoDialog] = useState(null); // gen

    const handleRefineImage = async () => {
        if (!refineImageDialog) return;
        const { gen, img, refinePrompt } = refineImageDialog;
        setRefining(true);
        try {
            const refRes = await fetch("/api/image/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl: img.url,
                    blobName: img.blobName,
                    prompt: refinePrompt,
                    maskDataUrl: refineImageDialog.maskDataUrl ?? null,
                    size: project.size,
                    format: project.format,
                    quality: project.quality,
                    background: project.background,
                }),
            });
            const refData = await refRes.json();
            if (!refRes.ok) throw new Error(refData.error || "Refinement failed");

            const generationId = crypto.randomUUID();
            let uploadedUrl = refData.url;
            let uploadedBlobName;
            try {
                const uploadRes = await fetch("/api/image/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dataUrl: refData.url, projectId, generationId, index: 0 }),
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    uploadedUrl = uploadData.url;
                    uploadedBlobName = uploadData.blobName;
                }
            } catch { /* fall back to data URL */ }

            addGeneration(
                projectId,
                [{ url: uploadedUrl, blobName: uploadedBlobName, size: project.size, adText: img.adText }],
                {
                    prompt: refinePrompt,
                    refinedFrom: [{ url: img.url, blobName: img.blobName }],
                    originalPrompt: gen.prompt ?? null,
                }
            );
            setRefineImageDialog(null);
            toast.success("Image refined!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setRefining(false);
        }
    };

    const handleSaveText = () => {
        if (!textDialog) return;
        updateImageAdText(projectId, textDialog.genId, textDialog.imgIndex, textDialog.text);
        setTextDialog(null);
        toast.success("Ad text updated.");
    };

    const handleDeleteGeneration = async (gen) => {
        // Remove from store immediately
        deleteGeneration(projectId, gen.id);
        // Delete blobs in background — don't block UI
        const blobNames = gen.images.map((img) => img.blobName).filter(Boolean);
        if (blobNames.length > 0) {
            fetch("/api/image/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blobNames }),
            }).catch(console.error);
        }
        toast.success("Generation deleted.");
    };

    const handleDeleteImage = async (gen, img, imgIndex) => {
        deleteImage(projectId, gen.id, imgIndex);
        if (img.blobName) {
            fetch("/api/image/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blobNames: [img.blobName] }),
            }).catch(console.error);
        }
        toast.success("Image deleted.");
    };

    // Flatten all images across generations for lightbox
    const allImages = project?.generations.flatMap((g) => g.images) ?? [];

    const { open: openLightbox, containerRef: lightboxRef, galleryName } = useLightbox(
        allImages.map((img) => img.url),
        "generated"
    );

    // Track global index offset per generation for lightbox
    const generationOffsets = [];
    let offset = 0;
    for (const gen of project?.generations ?? []) {
        generationOffsets.push(offset);
        offset += gen.images.length;
    }

    // Trigger ad text generation for any image that doesn't have it yet
    useEffect(() => {
        if (!project) return;
        project.generations.forEach((gen) => {
            gen.images.forEach((img, imgIndex) => {
                const key = `${gen.id}-${imgIndex}`;
                if (!img.adText && !generatingText.current.has(key)) {
                    generatingText.current.add(key);
                    fetch("/api/image/generate-text", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ imageUrl: img.url, blobName: img.blobName, guideline: project.guideline }),
                    })
                        .then((r) => r.json())
                        .then(({ text }) => {
                            if (text) updateImageAdText(projectId, gen.id, imgIndex, text);
                        })
                        .catch(console.error)
                        .finally(() => generatingText.current.delete(key));
                }
            });
        });
    }, [project?.generations, projectId, updateImageAdText]);

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
        <Layout aside={<ImageAside projectId={projectId} />}>
            <Flex direction="column" align="center" className="h-full w-full overflow-auto project-grid-background">
                {isGenerating && (
                    <Flex align="center" justify="center" p="6" gap="3">
                        <Spinner size="3" />
                        <Text size="2" color="gray">Generating image…</Text>
                    </Flex>
                )}

                {!isGenerating && project.generations.length === 0 && (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        gap="3"
                        className="h-full"
                    >
                        <IconPhoto size={48} style={{ color: "var(--gray-6)" }} />
                        <Text color="gray">No generations yet. Use the sidebar to create one.</Text>
                    </Flex>
                )}

                {project.generations.length > 0 && (
                    <Flex direction="column" gap="8" p="6">
                        {project.generations.map((gen, genIndex) => (
                            <Flex key={gen.id} direction="column" gap="3">
                                <Flex align="center" gap="2">
                                    <Text size="1" color="gray">
                                        {new Date(gen.createdAt).toLocaleString()}
                                    </Text>
                                </Flex>
                                <Flex wrap="wrap" gap="5" align="start">
                                    {gen.images.map((img, imgIndex) => {
                                        return (
                                            <Flex key={imgIndex} direction="column" gap="2">
                                                <AdCard
                                                    guideline={project.guideline}
                                                    img={img}
                                                    index={imgIndex}
                                                    onImageClick={() =>
                                                        openLightbox(generationOffsets[genIndex] + imgIndex)
                                                    }
                                                />
                                                <Flex gap="2" justify="between">
                                                    <Flex gap="2">
                                                        <Button
                                                            size="1"
                                                            variant="soft"
                                                            onClick={() => handleDeleteImage(gen, img, imgIndex)}
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
                                                    <Flex gap="2">
                                                        <Button
                                                            size="1"
                                                            variant="soft"
                                                            color="gray"
                                                            onClick={() => setRefineImageDialog({ gen, img, imgIndex, refinePrompt: "", maskDataUrl: null })}
                                                        >
                                                            <IconRefresh size={13} />
                                                            Refine Image
                                                        </Button>
                                                        <Button
                                                            size="1"
                                                            variant="soft"
                                                            color="gray"
                                                            onClick={() => setTextDialog({ genId: gen.id, imgIndex, text: img.adText ?? "", img })}
                                                        >
                                                            <IconPencil size={13} />
                                                            Refine Text
                                                        </Button>
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                        );
                                    })}
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                )}
            </Flex>

            <GenerationInfoDialog
                open={infoDialog !== null}
                onOpenChange={(open) => !open && setInfoDialog(null)}
                gen={infoDialog}
                samples={samples}
            />

            <RefineImageDialog
                open={refineImageDialog !== null}
                onOpenChange={(open) => !open && setRefineImageDialog(null)}
                prompt={refineImageDialog?.refinePrompt ?? ""}
                onPromptChange={(val) => setRefineImageDialog((prev) => prev ? { ...prev, refinePrompt: val } : null)}
                imageSrc={refineImageDialog?.img?.url ?? null}
                maskDataUrl={refineImageDialog?.maskDataUrl ?? null}
                onMaskChange={(val) => setRefineImageDialog((prev) => prev ? { ...prev, maskDataUrl: val } : null)}
                onConfirm={handleRefineImage}
                loading={refining}
            />

            <RefineTextDialog
                open={textDialog !== null}
                onOpenChange={(open) => !open && setTextDialog(null)}
                text={textDialog?.text ?? ""}
                onTextChange={(val) => setTextDialog((prev) => prev ? { ...prev, text: val } : null)}
                onSave={handleSaveText}
                img={textDialog?.img}
                guideline={project?.guideline}
            />

            <div ref={lightboxRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}>
                {allImages.map((img, i) => (
                    <a key={i} href={img.url} data-fslightbox={galleryName} />
                ))}
            </div>
        </Layout>
    );
}
