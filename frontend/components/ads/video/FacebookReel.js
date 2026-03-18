import { Flex, Box, Text, Badge, Spinner, Avatar, Button } from "@radix-ui/themes";
import {
    IconWorld,
    IconThumbUp,
    IconMessage,
    IconShare3,
    IconVideo,
    IconVolume,
    IconDotsVertical,
} from "@tabler/icons-react";
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

export default function FacebookReel({ gen }) {
    const isPending = gen.status === "queued" || gen.status === "in_progress";
    const isFailed = gen.status === "failed";
    const isCompleted = gen.status === "completed";
    const ad = parseAdText(gen.adText);

    return (
        <Flex direction="column" align="center" gap="3" style={{ width: 420 }}>
            {/* ── Reel player ─────────────────────────────────────────────────── */}
            <Box
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "9 / 16",
                    borderRadius: "var(--radius-4)",
                    overflow: "hidden",
                    background: "#000"
                }}
            >
                {/* Video / loading state */}
                {isCompleted && gen.url ? (
                    <video
                        src={gen.url}
                        controls={false}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }}
                    />
                ) : (
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        gap="3"
                        style={{ width: "100%", height: "100%", background: "var(--gray-3)" }}
                    >
                        {isPending && <Spinner size="3" style={{ color: "var(--accent-9)" }} />}
                        {isFailed && <IconVideo size={36} style={{ color: "var(--red-9)" }} />}
                        <Badge color={STATUS_COLOR[gen.status] ?? "gray"} variant="solid" size="2">
                            {STATUS_LABEL[gen.status] ?? gen.status}
                        </Badge>
                    </Flex>
                )}

                {/* ── Top chrome overlay ──────────────────────────────────────── */}
                <Flex
                    align="center"
                    justify="between"
                    px="3"
                    pt="3"
                    pb="2"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
                        zIndex: 10,
                    }}
                >
                    <Flex align="center" gap="2">
                        <Avatar
                            src="/profile.png"
                            fallback="C"
                            size="2"
                            radius="full"
                        />
                        <Flex direction="column" gap="0">
                            <Text size="2" weight="bold" style={{ color: "#fff" }}>Zava ✓</Text>
                            <Flex align="center" gap="1">
                                <Text size="1" style={{ color: "rgba(255,255,255,0.8)" }}>Sponsored</Text>
                                <Text size="1" style={{ color: "rgba(255,255,255,0.8)" }}>·</Text>
                                <IconWorld size={11} style={{ color: "rgba(255,255,255,0.8)", marginTop: 1 }} />
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex align="center" gap="2">
                        <IconVolume size={18} style={{ color: "#fff" }} />
                        <IconDotsVertical size={18} style={{ color: "#fff" }} />
                    </Flex>
                </Flex>

                {/* ── Bottom overlay: ad copy / loading ────────────────────── */}
                <Flex
                    direction="column"
                    gap="1"
                    px="3"
                    pb="3"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
                        zIndex: 10,
                    }}
                >
                    {gen.adText ? (
                        <Text
                            size="2"
                            weight="bold"
                            style={{ color: "#fff", lineHeight: 1.4, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                        >
                            {ad.body}
                        </Text>
                    ) : isCompleted ? (
                        <Flex align="center" gap="2">
                            <Spinner size="1" style={{ color: "#fff" }} />
                            <Text size="1" style={{ color: "rgba(255,255,255,0.8)" }}>Writing ad copy…</Text>
                        </Flex>
                    ) : null}
                </Flex>
            </Box>

            {/* ── Facebook chrome below reel ───────────────────────────────────── */}
            <Box
                style={{
                    width: "100%",
                    background: "var(--color-surface)",
                    border: "1px solid var(--gray-4)",
                    borderRadius: "var(--radius-3)",
                }}
            >
                {/* CTA row */}
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
                        <Text size="2" weight="bold">{!gen.adText ? "Shop the latest specials" : (ad.title || "Shop the latest specials")}</Text>
                    </Flex>
                    <Button size="2" variant="soft" color="gray" style={{ whiteSpace: "nowrap" }}>
                        {!gen.adText ? "Shop Now" : (ad.action || "Shop Now")}
                    </Button>
                </Flex>

                {/* Reaction row */}
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
            </Box>
        </Flex>
    );
}
