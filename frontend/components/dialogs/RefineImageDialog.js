import { useState } from "react";
import { Dialog, Flex, Button, TextArea } from "@radix-ui/themes";
import { IconMask } from "@tabler/icons-react";
import MaskEditorDialog from "@/components/dialogs/MaskEditorDialog";

/**
 * Props:
 *   open, onOpenChange, prompt, onPromptChange, onConfirm, loading
 *   imageSrc    – URL of the image being refined (for mask editor)
 *   maskDataUrl – current mask PNG dataURL | null
 *   onMaskChange – (dataUrl | null) => void
 */
export default function RefineImageDialog({ open, onOpenChange, prompt, onPromptChange, onConfirm, loading, imageSrc, maskDataUrl, onMaskChange }) {
    const [maskEditorOpen, setMaskEditorOpen] = useState(false);

    return (
        <>
            <Dialog.Root open={open} onOpenChange={onOpenChange}>
                <Dialog.Content maxWidth="500px">
                    <Dialog.Title>Refine Image</Dialog.Title>
                    <Dialog.Description size="2" mb="3" color="gray">
                        Describe what you'd like to change or improve in this image.
                    </Dialog.Description>
                    <Flex direction="column" gap="3">
                        <TextArea
                            placeholder="e.g. Make the background warmer, add more products on the shelf, sharpen the logo…"
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={4}
                            style={{ resize: "vertical" }}
                        />

                        {/* Footer */}
                        <Flex gap="2" justify="between" align="center">
                            <Flex gap="2" align="center">
                                {imageSrc && (
                                    <>
                                        <Button
                                            variant="soft"
                                            color={maskDataUrl ? "" : "gray"}
                                            onClick={() => setMaskEditorOpen(true)}
                                        >
                                            <IconMask size={16} />
                                            {maskDataUrl ? "Edit Mask" : "Paint Mask"}
                                        </Button>
                                        {maskDataUrl && (
                                            <Button
                                                variant="soft"
                                                color="gray"
                                                onClick={() => onMaskChange(null)}
                                            >
                                                Remove Mask
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Flex>
                            <Flex gap="2">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray" disabled={loading}>Cancel</Button>
                                </Dialog.Close>
                                <Button onClick={onConfirm} loading={loading} disabled={loading || !prompt.trim()}>
                                    Refine
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            <MaskEditorDialog
                open={maskEditorOpen}
                onOpenChange={setMaskEditorOpen}
                imageSrc={imageSrc}
                existingMaskDataUrl={maskDataUrl}
                onMask={onMaskChange}
            />
        </>
    );
}

