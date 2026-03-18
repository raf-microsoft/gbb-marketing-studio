import { useState } from "react";
import { Flex, Box, Badge, Spinner } from "@radix-ui/themes";
import { IconTrash } from "@tabler/icons-react";

export default function AssetsVideoItem({ item, isLocalhost, onDelete }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Flex direction="column" gap="1">
            <div className="group" style={{ position: "relative" }}>
                <Box
                    style={{
                        borderRadius: "var(--radius-3)",
                        overflow: "hidden",
                        border: "1px solid var(--gray-a5)",
                        aspectRatio: "9/16",
                        background: "#000",
                        position: "relative",
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
                    <video
                        src={item.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsLoading(false)}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                </Box>

                {isLocalhost && onDelete && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onDelete(item.name); }}
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
            </div>
            {item.lastModified && (
                <Badge size="1" variant="soft" color="gray">
                    {new Date(item.lastModified).toLocaleDateString()}
                </Badge>
            )}
        </Flex>
    );
}
