import { Dialog, Flex, Button, TextArea } from "@radix-ui/themes";
import { IconPlayerPlay } from "@tabler/icons-react";

export default function RemixVideoDialog({ open, onOpenChange, prompt, onPromptChange, onConfirm, loading }) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="500px">
                <Dialog.Title>Remix Video</Dialog.Title>
                <Dialog.Description size="2" mb="3" color="gray">
                    Describe a targeted change to this video. Keep it to one clear adjustment for best results — e.g. change the colour palette, shift the lighting, alter the background.
                </Dialog.Description>
                <Flex direction="column" gap="3">
                    <TextArea
                        placeholder="e.g. Shift the colour palette to warm amber tones with soft sunset lighting…"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        rows={4}
                        style={{ resize: "vertical" }}
                    />
                    <Flex gap="2" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" disabled={loading}>Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={onConfirm} loading={loading} disabled={loading || !prompt.trim()}>
                            <IconPlayerPlay size={14} />
                            Remix
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
