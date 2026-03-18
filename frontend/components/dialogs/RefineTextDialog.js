import { useState } from "react";
import { Dialog, Flex, Button, TextArea, TextField, Text, Spinner } from "@radix-ui/themes";
import { parseAdText, serializeAdText, hasTitle } from "@/lib/adText";

export default function RefineTextDialog({ open, onOpenChange, text, onTextChange, onSave, img, guideline }) {
    const [regenerating, setRegenerating] = useState(false);
    const showTitleAction = hasTitle(guideline);
    const parsed = parseAdText(text) ?? { title: null, body: "", action: "Shop Now" };

    const update = (patch) => onTextChange(serializeAdText({ ...parsed, ...patch }));

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const res = await fetch("/api/image/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: img?.url, blobName: img?.blobName, guideline: guideline ?? null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Regeneration failed");
            if (data.text) onTextChange(data.text);
        } catch (err) {
            console.error(err);
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="500px">
                <Dialog.Title>Refine Text</Dialog.Title>
                <Dialog.Description size="2" mb="3" color="gray">
                    Update the ad copy for this image.
                </Dialog.Description>
                <Flex direction="column" gap="3" style={{ opacity: regenerating ? 0.5 : 1, pointerEvents: regenerating ? "none" : undefined }}>
                    {showTitleAction && (
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">Title</Text>
                            <TextField.Root
                                value={parsed.title ?? ""}
                                onChange={(e) => update({ title: e.target.value })}
                                placeholder="Ad title / CTA heading"
                            />
                        </Flex>
                    )}
                    <Flex direction="column" gap="1">
                        <Text size="1" color="gray" weight="medium">Body</Text>
                        <div style={{ position: "relative" }}>
                            <TextArea
                                value={parsed.body}
                                onChange={(e) => update({ body: e.target.value })}
                                rows={6}
                                style={{ resize: "vertical" }}
                            />
                            {regenerating && (
                                <Flex align="center" justify="center" gap="2" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                                    <Spinner size="2" />
                                </Flex>
                            )}
                        </div>
                    </Flex>
                    {showTitleAction && (
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">Button label</Text>
                            <TextField.Root
                                value={parsed.action ?? ""}
                                onChange={(e) => update({ action: e.target.value })}
                                placeholder="e.g. Shop Now"
                            />
                        </Flex>
                    )}
                </Flex>
                <Flex gap="2" justify="between" align="center" mt="3">
                    <Button
                        variant="soft"
                        color="gray"
                        size="2"
                        onClick={handleRegenerate}
                        loading={regenerating}
                        disabled={regenerating}
                    >
                        Regenerate
                    </Button>
                    <Flex gap="2">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" disabled={regenerating}>Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={onSave} disabled={regenerating}>
                            Save
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
