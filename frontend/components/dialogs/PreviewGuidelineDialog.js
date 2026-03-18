import { useEffect, useState } from "react";
import { Dialog, Button, Flex, Text, Spinner, Box, Tabs } from "@radix-ui/themes";
import { IconLayoutList } from "@tabler/icons-react";

function GuidelinePane({ content, loading, error }) {
    if (loading) return <Flex justify="center" py="4"><Spinner size="2" /></Flex>;
    if (error) return <Text size="2" color="red">{error}</Text>;
    if (!content) return null;
    return (
        <pre
            style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontFamily: "var(--default-font-family)",
                fontSize: "var(--font-size-2)",
                lineHeight: 1.65,
                color: "var(--gray-12)",
            }}
        >
            {content}
        </pre>
    );
}

export default function PreviewGuidelineDialog({ type, slug, label }) {
    const [open, setOpen] = useState(false);
    const [genContent, setGenContent] = useState(null);
    const [adcopyContent, setAdcopyContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !type || !slug) return;
        setLoading(true);
        setError(null);
        setGenContent(null);
        setAdcopyContent(null);

        Promise.all([
            fetch(`/api/guidelines?type=${type}&slug=${slug}`).then((r) => r.json()),
            fetch(`/api/guidelines?type=${type}&slug=${slug}&section=adcopy`).then((r) => r.json()),
        ])
            .then(([gen, adcopy]) => {
                setGenContent(gen.error ? null : gen.content);
                setAdcopyContent(adcopy.error ? null : adcopy.content);
                if (gen.error && adcopy.error) throw new Error(gen.error);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [open, type, slug]);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 4,
                        fontSize: "var(--font-size-1)",
                        color: "var(--accent-11)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    <IconLayoutList size={14} />
                    Preview Guideline
                </button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="600px">
                <Dialog.Title>
                    <Flex align="center" gap="2">
                        <IconLayoutList size={16} />
                        {label ?? slug} Guideline
                    </Flex>
                </Dialog.Title>

                <Tabs.Root defaultValue="generation" mt="1">
                    <Tabs.List>
                        <Tabs.Trigger value="generation">
                            {type === "video" ? "Video" : "Image"} Generation
                        </Tabs.Trigger>
                        <Tabs.Trigger value="adcopy">Ad Copy</Tabs.Trigger>
                    </Tabs.List>

                    <Box
                        mt="3"
                        style={{
                            background: "var(--gray-2)",
                            borderRadius: "var(--radius-3)",
                            padding: "16px",
                            minHeight: 140,
                            maxHeight: "55vh",
                            overflowY: "auto",
                        }}
                    >
                        <Tabs.Content value="generation">
                            <GuidelinePane content={genContent} loading={loading} error={error} />
                        </Tabs.Content>
                        <Tabs.Content value="adcopy">
                            <GuidelinePane content={adcopyContent} loading={loading} error={error} />
                        </Tabs.Content>
                    </Box>
                </Tabs.Root>

                <Flex justify="end" mt="4">
                    <Dialog.Close asChild>
                        <Button variant="soft" color="gray">Close</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
