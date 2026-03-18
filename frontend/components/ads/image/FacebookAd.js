import { Flex, Box, Card, Text, Spinner, Avatar, Button } from "@radix-ui/themes";
import { IconThumbUp, IconMessage, IconShare3, IconWorld } from "@tabler/icons-react";
import { parseAdText } from "@/lib/adText";

export default function FacebookAd({ img, index, onImageClick }) {
    const ad = parseAdText(img.adText);
    const isLoading = !img.adText;
    return (
        <Card style={{ width: 500, padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <Flex align="center" justify="between" px="3" pt="3" pb="2">
                <Flex align="center" gap="2">
                    <Avatar
                        src="/profile.png"
                        fallback="C"
                        size="3"
                        radius="full"
                    />
                    <Flex direction="column" gap="0">
                        <Text size="2" weight="bold">Zava</Text>
                        <Flex align="center" gap="1">
                            <Text size="1" color="gray">Sponsored</Text>
                            <Text size="1" color="gray">·</Text>
                            <IconWorld size={11} style={{ color: "var(--gray-9)", marginTop: 1 }} />
                        </Flex>
                    </Flex>
                </Flex>
                <Text size="4" color="gray" style={{ letterSpacing: 2, lineHeight: 1 }}>···</Text>
            </Flex>

            {/* Ad copy */}
            <Box px="3" pb="2">
                {isLoading ? (
                    <Flex align="center" gap="2" style={{ height: 36 }}>
                        <Spinner size="1" />
                        <Text size="1" color="gray">Writing ad copy…</Text>
                    </Flex>
                ) : (
                    <Text size="2" style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {ad.body}
                    </Text>
                )}
            </Box>

            {/* Image */}
            <Box style={{ cursor: "zoom-in", lineHeight: 0 }} onClick={onImageClick}>
                <img
                    src={img.url}
                    alt={`Generated image ${index + 1}`}
                    style={{ width: "100%", height: "auto", display: "block" }}
                />
            </Box>

            {/* Footer CTA */}
            <Flex
                align="center"
                justify="between"
                px="3"
                py="2"
                style={{ borderBottom: "1px solid var(--gray-4)" }}
            >
                <Flex direction="column" gap="0">
                    <Flex align="center" gap="1">
                        <IconWorld size={12} style={{ color: "var(--gray-8)" }} />
                        <Text size="1" color="gray">zava.com</Text>
                    </Flex>
                    <Text size="2" weight="bold">{isLoading ? "Shop the latest specials" : (ad.title || "Shop the latest specials")}</Text>
                </Flex>
                <Button size="2" variant="soft" color="gray" style={{ whiteSpace: "nowrap" }}>
                    {isLoading ? "Shop Now" : (ad.action || "Shop Now")}
                </Button>
            </Flex>

            {/* Reactions row */}
            <Flex align="center" px="2" py="1" gap="1">
                {[
                    { icon: <IconThumbUp size={16} />, label: "Like" },
                    { icon: <IconMessage size={16} />, label: "Comment" },
                    { icon: <IconShare3 size={16} />, label: "Share" },
                ].map(({ icon, label }) => (
                    <Flex
                        key={label}
                        align="center"
                        gap="1"
                        px="3"
                        py="2"
                        style={{ flex: 1, justifyContent: "center", borderRadius: 4, cursor: "default", color: "var(--gray-11)" }}
                        className="hover:bg-[var(--gray-3)] transition-colors"
                    >
                        {icon}
                        <Text size="2" weight="medium" color="gray">{label}</Text>
                    </Flex>
                ))}
            </Flex>
        </Card>
    );
}
