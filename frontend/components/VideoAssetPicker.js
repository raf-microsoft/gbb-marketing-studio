import Image from "next/image";
import { useState } from "react";
import { Flex, Text, Spinner, Checkbox } from "@radix-ui/themes";
import { IconEye, IconTrash } from "@tabler/icons-react";
import DeleteAssetDialog from "@/components/dialogs/DeleteAssetDialog";

/**
 * Parses a Sora size string like "1280x720" into { w, h }.
 */
function parseSize(size) {
    const [w, h] = (size ?? "").split("x").map(Number);
    return { w: w || 0, h: h || 0 };
}


/**
 * Displays a filtered grid of sample assets that are aspect-ratio-compatible
 * with the currently selected Sora `size`. Selecting an image shows a checkmark.
 *
 * Props:
 *   size          – e.g. "720x1280"
 *   samples       – array of { id, src, filename }
 *   samplesLoading– boolean
 *   selectedAsset – filename string | null
 *   onSelect      – (filename | null) => void
 *   onPreview     – (index) => void  (index into `samples`, not filtered list)
 *   onDelete      – (id: string) => void
 */
export default function VideoAssetPicker({
    size,
    samples,
    samplesLoading,
    selectedAsset,
    view = "grid",
    onSelect,
    onPreview,
    onDelete,
}) {
    const [deleteAssetId, setDeleteAssetId] = useState(null);
    const { w: targetW, h: targetH } = parseSize(size);
    const isList = view === "list";
    const isPortrait = targetH > targetW;

    if (samplesLoading) {
        return (
            <Flex align="center" justify="center" py="4">
                <Spinner size="2" />
            </Flex>
        );
    }

    if (samples.length === 0) {
        return (
            <Flex direction="column" align="center" gap="1" py="3">
                <Text size="1" color="gray" align="center">
                    No assets available.
                </Text>
            </Flex>
        );
    }

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: isList ? "1fr" : "1fr 1fr", gap: 8 }}>
                {samples.map((asset) => {
                    const globalIndex = samples.indexOf(asset);
                    const isSelected = selectedAsset === asset.filename;

                    return (
                        <div
                            key={asset.id}
                            className="group"
                            onClick={() => onSelect(isSelected ? null : asset.filename)}
                            style={{
                                position: "relative",
                                aspectRatio: isList ? "16 / 9" : `${targetW} / ${targetH}`,
                                overflow: "hidden",
                                borderRadius: 10,
                                backgroundColor: "var(--black-a12)",
                                cursor: "pointer",
                                outline: isSelected
                                    ? "2px solid var(--accent-9)"
                                    : "2px solid transparent",
                                outlineOffset: -2,
                            }}
                        >
                            <Image
                                src={asset.src}
                                alt={asset.filename}
                                fill
                                className={isPortrait ? "object-contain" : "object-cover"}
                                sizes={isList ? "320px" : "120px"}
                                unoptimized
                            />

                            {/* Hover overlay with eye icon */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview(globalIndex);
                                }}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                                style={{ zIndex: 5 }}
                            >
                                <IconEye
                                    size={20}
                                    color="white"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                                />
                                <div
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                        position: "absolute", top: 0, left: 0, right: 0,
                                        padding: "4px 6px",
                                        background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
                                        color: "white", fontSize: 10, lineHeight: 1.3,
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}
                                >
                                    {asset.filename.replace(/^\d+-/, "")}
                                </div>
                            </div>

                            {/* Delete button top-right — hidden for protected zava-brand assets */}
                            {onDelete && !asset.id.includes("zava-brand") && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setDeleteAssetId(asset.id); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                        position: "absolute", bottom: 6, left: 6, zIndex: 20,
                                        cursor: "pointer", lineHeight: 0, color: "white",
                                    }}
                                >
                                    <IconTrash size={18} />
                                </button>
                            )}

                            {/* Checkbox — always visible */}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ position: "absolute", bottom: 8, right: 8, zIndex: 10 }}
                                onClickCapture={(e) => {
                                    e.stopPropagation();
                                    onSelect(isSelected ? null : asset.filename);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    size="3"
                                    style={{ display: "block", cursor: "pointer" }}
                                    onCheckedChange={() => { }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <DeleteAssetDialog
                open={deleteAssetId !== null}
                onOpenChange={(open) => !open && setDeleteAssetId(null)}
                onConfirm={() => {
                    if (deleteAssetId) {
                        onDelete(deleteAssetId);
                        setDeleteAssetId(null);
                    }
                }}
                count={1}
            />
        </>
    );
}
