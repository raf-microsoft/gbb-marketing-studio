import { Dialog, Flex, Button, TextArea, TextField, Text, Spinner } from "@radix-ui/themes";
import { parseAdText, serializeAdText, hasTitle } from "@/lib/adText";

/**
 * Refine / edit ad copy for a generated video.
 * Regenerate calls /api/video/generate-text using the gen's own prompt + reference asset.
 */
export default function RefineVideoTextDialog({ open, onOpenChange, text, onTextChange, onSave, gen, guideline }) {
    const showTitleAction = hasTitle(guideline);
    const parsed = parseAdText(text === "__loading__" ? "" : text) ?? { title: null, body: "", action: null };

    const update = (patch) => onTextChange(serializeAdText({ ...parsed, ...patch }));

    const handleRegenerate = async () => {
        onTextChange("__loading__");
        try {
            const res = await fetch("/api/video/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: gen?.prompt,
                    referenceAssetFilename: gen?.referenceAssetFilename ?? null,
                    guideline: guideline ?? null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Regeneration failed");
            if (data.text) onTextChange(data.text);
        } catch (err) {
            console.error(err);
            onTextChange(text === "__loading__" ? "" : text);
        }
    };

    const isRegenerating = text === "__loading__";

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="500px">
                <Dialog.Title>Refine Text</Dialog.Title>
                <Dialog.Description size="2" mb="3" color="gray">
                    Update the ad copy for this video.
                </Dialog.Description>
                <Flex direction="column" gap="3" style={{ opacity: isRegenerating ? 0.5 : 1, pointerEvents: isRegenerating ? "none" : undefined }}>
                    {showTitleAction && (
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">Title</Text>
                            <TextField.Root
                                value={parsed.title ?? ""}
                                onChange={(e) => update({ title: e.target.value })}
                                placeholder="Ad title / overlay headline"
                            />
                        </Flex>
                    )}
                    <Flex direction="column" gap="1">
                        <Text size="1" color="gray" weight="medium">Body</Text>
                        <div style={{ position: "relative" }}>
                            <TextArea
                                value={isRegenerating ? "" : parsed.body}
                                onChange={(e) => update({ body: e.target.value })}
                                rows={6}
                                style={{ resize: "vertical" }}
                            />
                            {isRegenerating && (
                                <Flex align="center" justify="center" gap="2" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                                    <Spinner size="2" />
                                </Flex>
                            )}
                        </div>
                    </Flex>
                    {showTitleAction && parsed.action !== null && (
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
                        loading={isRegenerating}
                        disabled={isRegenerating}
                    >
                        Regenerate
                    </Button>
                    <Flex gap="2">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" disabled={isRegenerating}>Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={onSave} disabled={isRegenerating}>
                            Save
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
