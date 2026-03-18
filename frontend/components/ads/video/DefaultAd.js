import { Flex, Box, Card, Text, Spinner, Badge } from "@radix-ui/themes";
import { IconVideo } from "@tabler/icons-react";
import { parseAdText } from "@/lib/adText";

const STATUS_COLOR = {
    queued: "gray",
    in_progress: "gray",
    completed: "green",
    failed: "red",
};

const STATUS_LABEL = {
    queued: "Queued",
    in_progress: "Generating…",
    completed: "Completed",
    failed: "Failed",
};

export default function DefaultAd({ gen }) {
    const isPending = gen.status === "queued" || gen.status === "in_progress";
    const isFailed = gen.status === "failed";
    const isCompleted = gen.status === "completed";
    const ad = parseAdText(gen.adText);

    return (
        <Card style={{ width: 840, padding: 0, overflow: "hidden" }}>
            <Flex direction="column" gap="0">
                {/* Video / status area */}
                <Box
                    style={{
                        width: "100%",
                        aspectRatio: gen.size
                            ? gen.size.replace("x", " / ")
                            : "16 / 9",
                        background: "var(--gray-3)",
                        position: "relative",
                    }}
                >
                    {isCompleted && gen.url ? (
                        <video
                            src={gen.url}
                            controls
                            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
                        />
                    ) : (
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            gap="2"
                            style={{ width: "100%", height: "100%" }}
                        >
                            {isPending && <Spinner size="3" style={{ color: "var(--accent-9)" }} />}
                            {isFailed && <IconVideo size={32} style={{ color: "var(--red-9)" }} />}
                            <Badge color={STATUS_COLOR[gen.status] ?? "gray"} variant="solid" size="2">
                                {STATUS_LABEL[gen.status] ?? gen.status}
                            </Badge>
                        </Flex>
                    )}
                </Box>

                {/* Ad copy + meta */}
                <Box p="3">
                    <Flex align="center" gap="2" mb="2">
                        {gen.size && <Badge color="gray" variant="outline" size="1">{gen.size}</Badge>}
                        {gen.seconds && <Badge color="gray" variant="outline" size="1">{gen.seconds}s</Badge>}
                    </Flex>
                    {gen.adText ? (
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
                    ) : isCompleted ? (
                        <Flex align="center" gap="2" style={{ height: 40 }}>
                            <Spinner size="1" />
                            <Text size="1" color="gray">Writing ad copy…</Text>
                        </Flex>
                    ) : null}
                </Box>
            </Flex>
        </Card>
    );
}
