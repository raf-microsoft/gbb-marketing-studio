import { useState } from "react";
import { Flex, Box, Badge, Spinner, Checkbox } from "@radix-ui/themes";
import { IconTrash, IconEye } from "@tabler/icons-react";

export default function AssetsBrandItem({ sample, galleryName, isSelected, onDelete, onToggle }) {
    const [isLoading, setIsLoading] = useState(true);
    const displayName = sample.filename.replace(/^\d+-/, "");

    return (
        <Flex direction="column" gap="1">
            <div className="group" style={{ position: "relative" }}>
                <a
                    data-fslightbox={galleryName}
                    href={sample.src}
                    style={{ display: "block", textDecoration: "none" }}
                >
                    <Box
                        style={{
                            cursor: "zoom-in",
                            borderRadius: "var(--radius-3)",
                            overflow: "hidden",
                            aspectRatio: "4/3",
                            position: "relative",
                            outline: isSelected ? "2px solid var(--accent-9)" : "2px solid transparent",
                            outlineOffset: -2,
                            background: "var(--gray-a3)",
                        }}
                    >
                        {isLoading && (
                            <Flex
                                align="center"
                                justify="center"
                                style={{ position: "absolute", inset: 0, zIndex: 1 }}
                            >
                                <Spinner size="3" />
                            </Flex>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={sample.src}
                            alt={sample.filename}
                            onLoad={() => setIsLoading(false)}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                            style={{ zIndex: 5 }}
                        >
                            <IconEye
                                size={22}
                                color="white"
                                className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                            />
                        </div>
                    </Box>
                </a>

                {onDelete && !sample.id.includes("zava-brand") && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onDelete(sample.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                            position: "absolute", bottom: 6, left: 6, zIndex: 20,
                            cursor: "pointer", lineHeight: 0, color: "white",
                            background: "none", border: "none", padding: 0,
                        }}
                    >
                        <IconTrash size={18} />
                    </button>
                )}

                {onToggle && !sample.id.includes("zava-brand") && (
                    <div
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(sample.id); }}
                        style={{ position: "absolute", bottom: 8, right: 8, zIndex: 20 }}
                    >
                        <Checkbox
                            checked={isSelected}
                            size="3"
                            style={{ display: "block", cursor: "pointer" }}
                            onCheckedChange={() => { }}
                        />
                    </div>
                )}
            </div>
            <Badge size="1" variant="soft" color="gray">{displayName}</Badge>
        </Flex>
    );
}
