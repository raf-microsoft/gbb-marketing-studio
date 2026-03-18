import { useState } from "react";
import { toast } from "react-toastify";

/**
 * Provides clipboard image upload helpers for use in prompt sidebars.
 *
 * @param {() => void} refresh - called after a successful upload to reload the asset list
 * @returns {{ pasting, uploadImageBlob, pasteFromClipboard, handlePromptPaste }}
 */
export default function useClipboardUpload(refresh) {
    const [pasting, setPasting] = useState(false);

    async function uploadImageBlob(blob, imageType) {
        const ext = imageType.split("/")[1] || "png";
        const filename = `clipboard-${Date.now()}.${ext}`;
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        setPasting(true);
        try {
            const res = await fetch("/api/assets/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataUrl, filename }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Clipboard image uploaded!");
            refresh();
        } catch (err) {
            toast.error("Could not paste from clipboard: " + err.message);
        } finally {
            setPasting(false);
        }
    }

    async function pasteFromClipboard() {
        try {
            const items = await navigator.clipboard.read();
            const imageItem = items.find((item) => item.types.some((t) => t.startsWith("image/")));
            if (!imageItem) { toast.error("No image found in clipboard."); return; }
            const imageType = imageItem.types.find((t) => t.startsWith("image/"));
            const blob = await imageItem.getType(imageType);
            await uploadImageBlob(blob, imageType);
        } catch (err) {
            toast.error("Could not paste from clipboard: " + err.message);
        }
    }

    function handlePromptPaste(e) {
        const items = Array.from(e.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return;
        e.preventDefault();
        const blob = imageItem.getAsFile();
        if (blob) uploadImageBlob(blob, imageItem.type);
    }

    return { pasting, uploadImageBlob, pasteFromClipboard, handlePromptPaste };
}
