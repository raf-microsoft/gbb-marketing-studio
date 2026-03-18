import { Flex, Box, Text, Badge, Spinner, Avatar } from "@radix-ui/themes";
import {
    IconVideo,
    IconThumbUp,
    IconThumbDown,
    IconMessage,
    IconShare3,
    IconBookmark,
    IconDotsVertical,
    IconVolume,
    IconSearch,
    IconBell,
    IconBrandYoutubeFilled,
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

export default function YouTubeShort({ gen }) {
    const isPending = gen.status === "queued" || gen.status === "in_progress";
    const isFailed = gen.status === "failed";
    const isCompleted = gen.status === "completed";
    const ad = parseAdText(gen.adText);

    return (
        <Flex direction="column" align="center" gap="0" style={{ width: 390, background: "#0f0f0f", borderRadius: "var(--radius-4)", overflow: "hidden" }}>

            {/* ── YouTube top bar ────────────────────────────────────────────── */}
            <Flex
                align="center"
                justify="between"
                px="3"
                py="2"
                style={{ width: "100%", background: "#0f0f0f", borderBottom: "1px solid #272727" }}
            >
                <Flex align="center" gap="2">
                    <IconBrandYoutubeFilled size={28} style={{ color: "#FF0000" }} />
                    <Text size="2" weight="bold" style={{ color: "#fff", letterSpacing: "-0.3px" }}>Shorts</Text>
                </Flex>
                <Flex align="center" gap="3">
                    <IconSearch size={18} style={{ color: "#aaa" }} />
                    <IconBell size={18} style={{ color: "#aaa" }} />
                    <Avatar src="/profile.png" fallback="Z" size="1" radius="full" />
                </Flex>
            </Flex>

            {/* ── Short player ──────────────────────────────────────────────── */}
            <Box
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "9 / 16",
                    background: "#000",
                    overflow: "hidden",
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
                        style={{ width: "100%", height: "100%", background: "#1a1a1a" }}
                    >
                        {isPending && <Spinner size="3" style={{ color: "#fff" }} />}
                        {isFailed && <IconVideo size={36} style={{ color: "var(--red-9)" }} />}
                        <Badge color={STATUS_COLOR[gen.status] ?? "gray"} variant="solid" size="2">
                            {STATUS_LABEL[gen.status] ?? gen.status}
                        </Badge>
                    </Flex>
                )}

                {/* ── Right-side action icons ────────────────────────────────── */}
                <Flex
                    direction="column"
                    align="center"
                    gap="5"
                    style={{
                        position: "absolute",
                        right: 10,
                        bottom: 80,
                        zIndex: 10,
                    }}
                >
                    {[
                        { icon: <IconThumbUp size={22} />, label: "4.2K" },
                        { icon: <IconThumbDown size={22} />, label: "Dislike" },
                        { icon: <IconMessage size={22} />, label: "312" },
                        { icon: <IconShare3 size={22} />, label: "Share" },
                        { icon: <IconBookmark size={22} />, label: "Save" },
                        { icon: <IconDotsVertical size={22} />, label: "" },
                    ].map(({ icon, label }) => (
                        <Flex key={label || "more"} direction="column" align="center" gap="1" style={{ cursor: "default" }}>
                            <Box
                                style={{
                                    background: "rgba(255,255,255,0.12)",
                                    borderRadius: "50%",
                                    width: 44,
                                    height: 44,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                }}
                            >
                                {icon}
                            </Box>
                            {label && <Text size="1" style={{ color: "#fff", fontWeight: 600 }}>{label}</Text>}
                        </Flex>
                    ))}
                    {/* Channel avatar */}
                    <Box style={{ position: "relative" }}>
                        <Avatar
                            src="/profile.png"
                            fallback="Z"
                            size="3"
                            radius="full"
                            style={{ border: "2px solid #fff" }}
                        />
                        <Box
                            style={{
                                position: "absolute",
                                bottom: -6,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "#FF0000",
                                borderRadius: "50%",
                                width: 16,
                                height: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: "bold",
                                lineHeight: 1,
                            }}
                        >+</Box>
                    </Box>
                </Flex>

                {/* ── Bottom overlay: channel + ad copy ─────────────────────── */}
                <Flex
                    direction="column"
                    gap="1"
                    px="3"
                    pb="3"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 60,
                        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                        zIndex: 10,
                    }}
                >
                    <Flex align="center" gap="2">
                        <Text size="2" weight="bold" style={{ color: "#fff" }}>@zava</Text>
                        <Box
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: 4,
                                padding: "1px 6px",
                            }}
                        >
                            <Text size="1" style={{ color: "#fff" }}>Subscribe</Text>
                        </Box>
                    </Flex>

                    {gen.adText ? (
                        <>
                            {ad.title && (
                                <Text size="2" weight="bold" style={{ color: "#fff", lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                                    {ad.title}
                                </Text>
                            )}
                            <Text size="1" style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.4, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                                {ad.body}
                            </Text>
                        </>
                    ) : isCompleted ? (
                        <Flex align="center" gap="2">
                            <Spinner size="1" style={{ color: "#fff" }} />
                            <Text size="1" style={{ color: "rgba(255,255,255,0.8)" }}>Writing ad copy…</Text>
                        </Flex>
                    ) : null}

                    {/* Sound bar */}
                    <Flex align="center" gap="1" mt="1">
                        <IconVolume size={12} style={{ color: "rgba(255,255,255,0.7)" }} />
                        <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Original audio · Zava</Text>
                    </Flex>
                </Flex>
            </Box>

            {/* ── CTA below video ───────────────────────────────────────────── */}
            {gen.adText && (
                <Flex
                    align="center"
                    justify="between"
                    px="3"
                    py="2"
                    style={{ width: "100%", background: "#0f0f0f", borderTop: "1px solid #272727" }}
                >
                    <Flex direction="column" gap="0">
                        <Text size="1" style={{ color: "#aaa" }}>zava.com</Text>
                        <Text size="2" weight="bold" style={{ color: "#fff" }}>
                            {ad.title || "Shop the latest specials"}
                        </Text>
                    </Flex>
                    <Flex
                        align="center"
                        justify="center"
                        style={{
                            background: "#fff",
                            color: "#0f0f0f",
                            borderRadius: 20,
                            padding: "7px 14px 6px 14px",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "default",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {ad.action || "Shop Now"}
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
}
