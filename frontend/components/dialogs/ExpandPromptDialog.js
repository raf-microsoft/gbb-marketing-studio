import { useState, useEffect } from "react";
import { Dialog, Flex, Button, TextArea, Text } from "@radix-ui/themes";

export default function ExpandPromptDialog({ open, onOpenChange, value, onInsert }) {
    const [draft, setDraft] = useState(value ?? "");

    // Sync draft when dialog opens
    useEffect(() => {
        if (open) setDraft(value ?? "");
    }, [open, value]);

    const handleInsert = () => {
        onInsert(draft);
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="680px" style={{ width: "90vw" }}>
                <Dialog.Title>Prompt Editor</Dialog.Title>
                <Dialog.Description size="2" mb="3" color="gray">
                    Compose a detailed prompt. Click <strong>Insert</strong> to apply it.
                </Dialog.Description>
                <Flex direction="column" gap="3">
                    <TextArea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={16}
                        placeholder="Describe what you want to generate in detail…"
                        style={{ resize: "vertical", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6 }}
                        autoFocus
                    />
                    <Flex gap="2" justify="end" align="center">
                        <Text size="1" color="gray" style={{ marginRight: "auto" }}>
                            {draft.length} characters
                        </Text>
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={handleInsert}>
                            Insert
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
