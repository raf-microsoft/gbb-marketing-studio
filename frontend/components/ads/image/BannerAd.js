import { Flex, Box, Card, Text, Spinner, Button } from "@radix-ui/themes";
import { parseAdText } from "@/lib/adText";

export default function BannerAd({ img, index, onImageClick }) {
    const ad = parseAdText(img.adText);
    const isLoading = !img.adText;

    return (
        <Card style={{ width: 840, padding: 0, overflow: "hidden" }}>
            <Flex direction="column" gap="0">
                {/* Image with title overlay */}
                <Box style={{ position: "relative", cursor: "zoom-in", lineHeight: 0 }} onClick={onImageClick}>
                    <img
                        src={img.url}
                        alt={`Generated image ${index + 1}`}
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />
                    {/* Title overlay */}
                    <Box style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
                        padding: "32px 20px 16px",
                    }}>
                        {isLoading ? (
                            <Flex align="center" gap="2">
                                <Spinner size="1" style={{ color: "white" }} />
                                <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Writing copy…</Text>
                            </Flex>
                        ) : (
                            <Flex align="center" justify="between" gap="4">
                                <Flex direction="column" gap="1">
                                    {ad.title && (
                                        <Text size="5" weight="bold" style={{ color: "white", lineHeight: 1.2 }}>
                                            {ad.title}
                                        </Text>
                                    )}
                                    {ad.body && (
                                        <Text size="2" style={{ color: "rgba(255,255,255,0.85)" }}>
                                            {ad.body}
                                        </Text>
                                    )}
                                </Flex>
                                {ad.action && (
                                    <Button
                                        size="2"
                                        variant="solid"
                                        style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {ad.action}
                                    </Button>
                                )}
                            </Flex>
                        )}
                    </Box>
                </Box>
            </Flex>
        </Card>
    );
}
