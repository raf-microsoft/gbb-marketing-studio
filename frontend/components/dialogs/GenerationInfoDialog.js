import { useState } from "react";
import { Dialog, Flex, Text, Button, Badge, ScrollArea, Separator } from "@radix-ui/themes";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import useLightbox from "@/hooks/useLightbox";

function CopyButton({ value }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <Button size="1" variant="ghost" color="gray" onClick={handleCopy} style={{ cursor: "pointer" }}>
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? "Copied" : "Copy"}
        </Button>
    );
}

function InfoRow({ label, children }) {
    return (
        <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">{label}</Text>
            {children}
        </Flex>
    );
}

export default function GenerationInfoDialog({ open, onOpenChange, gen, samples = [] }) {
    // Build a map from sample id/filename → src for thumbnail lookup
    const sampleMap = Object.fromEntries(samples.map((s) => [s.id ?? s.filename ?? s.src, s]));
    const sources = gen ? (gen.selectedAssets ?? (gen.referenceAssetFilename ? [gen.referenceAssetFilename] : [])) : [];
    const sourceUrls = sources.map((id) => sampleMap[id]?.src).filter(Boolean);

    // Refined-from images (previous generated images used as reference)
    const refinedFromImages = gen?.refinedFrom ?? [];
    const refinedFromUrls = refinedFromImages.map((img) => img.url).filter(Boolean);

    const { open: openLightbox, containerRef, galleryName } = useLightbox(sourceUrls, "gen-info-sources");
    const { open: openRefinedLightbox, containerRef: refinedContainerRef, galleryName: refinedGalleryName } = useLightbox(refinedFromUrls, "gen-info-refined");

    if (!gen) return null;

    return (
        <>
            <Dialog.Root open={open} onOpenChange={onOpenChange}>
                <Dialog.Content maxWidth="640px">
                    <Dialog.Title>Generation Info</Dialog.Title>

                    <Flex direction="column" gap="4" mt="2">
                        {/* Gen ID */}
                        <InfoRow label="Generation ID">
                            <Flex align="center" gap="2">
                                <Text size="2" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{gen.id}</Text>
                                <CopyButton value={gen.id} />
                            </Flex>
                        </InfoRow>

                        <Separator size="4" />

                        {/* Timestamp */}
                        <InfoRow label="Created At">
                            <Text size="2">{new Date(gen.createdAt).toLocaleString()}</Text>
                        </InfoRow>

                        <Separator size="4" />

                        {/* Prompt */}
                        <InfoRow label="Prompt">
                            {gen.prompt ? (
                                <ScrollArea style={{ maxHeight: 140 }} scrollbars="vertical">
                                    <Text size="2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{gen.prompt}</Text>
                                </ScrollArea>
                            ) : (
                                <Text size="2" color="gray">No prompt recorded</Text>
                            )}
                        </InfoRow>

                        {/* Original prompt (when this is a refinement) */}
                        {gen.originalPrompt && (
                            <>
                                <Separator size="4" />
                                <InfoRow label="Original Prompt">
                                    <ScrollArea style={{ maxHeight: 100 }} scrollbars="vertical">
                                        <Text size="2" color="gray" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{gen.originalPrompt}</Text>
                                    </ScrollArea>
                                </InfoRow>
                            </>
                        )}

                        {/* Refined from (previously generated image used as reference) */}
                        {refinedFromImages.length > 0 && (
                            <>
                                <Separator size="4" />
                                <InfoRow label="Refined From">
                                    <Flex gap="2" wrap="wrap" align="center">
                                        {refinedFromImages.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img.url}
                                                alt={`refined-source-${i}`}
                                                onClick={() => openRefinedLightbox(i)}
                                                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid var(--gray-5)", cursor: "zoom-in" }}
                                            />
                                        ))}
                                    </Flex>
                                </InfoRow>
                            </>
                        )}

                        {/* Sources */}
                        {sources.length > 0 && (
                            <>
                                <Separator size="4" />
                                <InfoRow label={`Source Asset${sources.length > 1 ? "s" : ""}`}>
                                    <Flex gap="2" wrap="wrap" align="center">
                                        {sources.map((id, i) => {
                                            const sample = sampleMap[id];
                                            const lightboxIndex = sourceUrls.indexOf(sample?.src);
                                            return sample?.src ? (
                                                <img
                                                    key={id}
                                                    src={sample.src}
                                                    alt={id}
                                                    title={id}
                                                    onClick={() => openLightbox(lightboxIndex >= 0 ? lightboxIndex : i)}
                                                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid var(--gray-5)", cursor: "zoom-in" }}
                                                />
                                            ) : (
                                                <Badge key={id} color="gray" variant="soft" style={{ fontFamily: "monospace", fontSize: 11 }}>
                                                    {id}
                                                </Badge>
                                            );
                                        })}
                                    </Flex>
                                </InfoRow>
                            </>
                        )}

                        {/* Video-specific */}
                        {(gen.size || gen.seconds) && (
                            <>
                                <Separator size="4" />
                                <Flex gap="4">
                                    {gen.size && (
                                        <InfoRow label="Size">
                                            <Text size="2">{gen.size}</Text>
                                        </InfoRow>
                                    )}
                                    {gen.seconds && (
                                        <InfoRow label="Duration">
                                            <Text size="2">{gen.seconds}s</Text>
                                        </InfoRow>
                                    )}
                                    {gen.jobId && (
                                        <InfoRow label="Job ID">
                                            <Flex align="center" gap="2">
                                                <Text size="2" style={{ fontFamily: "monospace" }}>{gen.jobId}</Text>
                                                <CopyButton value={gen.jobId} />
                                            </Flex>
                                        </InfoRow>
                                    )}
                                </Flex>
                            </>
                        )}
                    </Flex>

                    <Flex justify="end" mt="4">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Close</Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {/* Hidden lightbox anchors for fslightbox */}
            <div ref={containerRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}>
                {sourceUrls.map((src, i) => (
                    <a key={i} href={src} data-fslightbox={galleryName} />
                ))}
            </div>
            <div ref={refinedContainerRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}>
                {refinedFromUrls.map((src, i) => (
                    <a key={i} href={src} data-fslightbox={refinedGalleryName} />
                ))}
            </div>
        </>
    );
}
