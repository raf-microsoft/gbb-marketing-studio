import Image from "next/image";
import { useState } from "react";
import { Flex, Text, Checkbox, Spinner } from "@radix-ui/themes";
import { IconEye, IconTrash } from "@tabler/icons-react";
import DeleteAssetDialog from "@/components/dialogs/DeleteAssetDialog";

/**
 * Multi-select asset grid for image generation.
 * All samples are shown (gpt-image-1 accepts any reference image regardless of dimensions).
 * Selection is tracked as an array of asset IDs via checkboxes.
 *
 * Props:
 *   samples        – array of { id, src, filename }
 *   samplesLoading – boolean
 *   selectedAssets – string[] of selected asset IDs
 *   onToggle       – (id: string) => void  — toggles one asset in/out of selection
 *   onPreview      – (index: number) => void
 *   onDelete       – (id: string) => void
 */
export default function ImageAssetPicker({
    samples,
    samplesLoading,
    selectedAssets = [],
    view = "grid",
    onToggle,
    onPreview,
    onDelete,
}) {
    const [deleteAssetId, setDeleteAssetId] = useState(null);
    const [portraitIds, setPortraitIds] = useState(new Set());

    if (samplesLoading) {
        return (
            <Flex align="center" justify="center" py="4">
                <Spinner size="2" />
            </Flex>
        );
    }

    if (!samples.length) {
        return (
            <Flex align="center" justify="center" py="3">
                <Text size="1" color="gray">No assets found.</Text>
            </Flex>
        );
    }

    const isList = view === "list";

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: isList ? "1fr" : "1fr 1fr", gap: 8 }}>
                {samples.map((asset, index) => {
                    const isSelected = selectedAssets.includes(asset.id);
                    return (
                        <div
                            key={asset.id}
                            className="group"
                            style={{
                                position: "relative",
                                aspectRatio: isList ? "16 / 9" : "1",
                                overflow: "hidden",
                                borderRadius: 10,
                                backgroundColor: "var(--black-a12)",
                                outline: isSelected ? "2px solid var(--accent-9)" : "2px solid transparent",
                                outlineOffset: -2,
                            }}
                        >
                            <Image
                                src={asset.src}
                                alt={asset.filename}
                                fill
                                className={portraitIds.has(asset.id) ? "object-contain" : "object-cover"}
                                sizes={isList ? "320px" : "120px"}
                                unoptimized
                                onLoad={(e) => {
                                    if (e.target.naturalHeight > e.target.naturalWidth) {
                                        setPortraitIds(prev => new Set([...prev, asset.id]));
                                    }
                                }}
                            />

                            {/* Hover overlay with eye/preview icon */}
                            <div
                                onClick={(e) => { e.stopPropagation(); onPreview(index); }}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                                style={{ zIndex: 5, cursor: "zoom-in" }}
                            >
                                <IconEye
                                    size={22}
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

                            {/* Delete button — hidden for protected zava-brand assets */}
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

                            {/* Checkbox bottom-right */}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ position: "absolute", bottom: 8, right: 8, zIndex: 10 }}
                                onClickCapture={(e) => {
                                    e.stopPropagation();
                                    onToggle(asset.id);
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
