import { useState, useRef, useCallback } from "react";
import { Flex, Text, Spinner } from "@radix-ui/themes";
import { IconCloudUpload } from "@tabler/icons-react";
import { toast } from "react-toastify";

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function AssetDropZone({ onUploaded }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const uploadFiles = useCallback(async (files) => {
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (!imageFiles.length) {
            toast.error("Please drop image files only.");
            return;
        }

        setUploading(true);
        let successCount = 0;

        for (const file of imageFiles) {
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const res = await fetch("/api/assets/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dataUrl, filename: file.name }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                successCount++;
            } catch (err) {
                toast.error(`Failed to upload ${file.name}: ${err.message}`);
            }
        }

        setUploading(false);
        if (successCount > 0) {
            toast.success(`${successCount} asset${successCount > 1 ? "s" : ""} uploaded.`);
            onUploaded?.();
        }
    }, [onUploaded]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        uploadFiles(e.dataTransfer.files);
    }, [uploadFiles]);

    const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
    const handleDragLeave = useCallback(() => setDragging(false), []);

    const handleFileChange = useCallback((e) => {
        uploadFiles(e.target.files);
        e.target.value = "";
    }, [uploadFiles]);

    return (
        <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: `1.5px dashed ${dragging ? "var(--accent-9)" : "var(--gray-5)"}`,
                borderRadius: 6,
                padding: "16px 8px",
                cursor: uploading ? "default" : "pointer",
                background: dragging ? "var(--accent-2)" : "transparent",
                transition: "border-color 0.15s, background 0.15s",
                textAlign: "center",
                userSelect: "none",
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            {uploading ? (
                <Flex align="center" justify="center" gap="2">
                    <Spinner size="1" />
                    <Text size="1" color="gray">Uploading…</Text>
                </Flex>
            ) : (
                <Flex align="center" justify="center" gap="2">
                    <IconCloudUpload size={14} style={{ color: dragging ? "var(--accent-9)" : "var(--gray-9)" }} />
                    <Text size="2" color={dragging ? "accent" : "gray"}>
                        {dragging ? "Drop to upload" : "Drop images or click to upload"}
                    </Text>
                </Flex>
            )}
        </div>
    );
}
