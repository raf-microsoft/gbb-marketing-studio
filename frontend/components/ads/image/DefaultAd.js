import { Flex, Box, Card, Text, Spinner } from "@radix-ui/themes";
import { parseAdText } from "@/lib/adText";

export default function DefaultAd({ img, index, onImageClick }) {
    const ad = parseAdText(img.adText);
    const isLoading = !img.adText;
    return (
        <Card style={{ width: 840, padding: 0, overflow: "hidden" }}>
            <Flex direction="column" gap="0">
                {/* Image area */}
                <Card
                    className="overflow-hidden cursor-zoom-in"
                    style={{ width: "100%", padding: 0, borderRadius: 0 }}
                    onClick={onImageClick}
                >
                    <img
                        src={img.url}
                        alt={`Generated image ${index + 1}`}
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />
                </Card>

                {/* Ad copy */}
                <Box p="3">
                    {isLoading ? (
                        <Flex align="center" gap="2" style={{ height: 40 }}>
                            <Spinner size="1" />
                            <Text size="1" color="gray">Writing ad copy…</Text>
                        </Flex>
                    ) : (
                        <Flex direction="column" gap="1">
                            {ad.title && (
                                <Text size="4" weight="bold" style={{ lineHeight: 1.3 }}>
                                    {ad.title}
                                </Text>
                            )}
                            <Text size="2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, display: "block" }}>
                                {ad.body}
                            </Text>
                        </Flex>
                    )}
                </Box>
            </Flex>
        </Card>
    );
}
