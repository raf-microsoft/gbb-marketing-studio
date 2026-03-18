import { Flex, Box, Text, Badge, Spinner, Avatar } from "@radix-ui/themes";
import {
    IconVideo,
    IconHeart,
    IconMessage,
    IconShare3,
    IconBookmark,
    IconMusic,
    IconVolume,
    IconSearch,
    IconPlus,
    IconBrandTiktokFilled,
} from "@tabler/icons-react";
import { parseAdText } from "@/lib/adText";

const STATUS_COLOR = {
    queued: "gray",
    in_progress: "gray",
    completed: "green",
    failed: "red",
};

const STATUS_LABEL = {
    queQueued: "Queued",
    queued: "Queued",
    in_progress: "Generating…",
    completed: "Completed",
    failed: "Failed",
};

export default function TikTokAd({ gen }) {
    const isPending = gen.status === "queued" || gen.status === "in_progress";
    const isFailed = gen.status === "failed";
    const isCompleted = gen.status === "completed";
    const ad = parseAdText(gen.adText);

    return (
        <Flex direction="column" align="center" gap="0" style={{ width: 390, background: "#000", borderRadius: "var(--radius-4)", overflow: "hidden" }}>

            {/* ── TikTok top bar ──────────────────────────────────────────────── */}
            <Flex
                align="center"
                justify="between"
                px="3"
                py="2"
                style={{ width: "100%", background: "#000" }}
            >
                <IconVolume size={20} style={{ color: "#fff", opacity: 0.7 }} />
                <Flex align="center" gap="2">
                    <IconBrandTiktokFilled size={22} style={{ color: "#fff" }} />
                    <Text size="2" weight="bold" style={{ color: "#fff", letterSpacing: "0.5px" }}>For You</Text>
                </Flex>
                <IconSearch size={20} style={{ color: "#fff", opacity: 0.7 }} />
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
                        style={{ width: "100%", height: "100%", background: "#111" }}
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
                        bottom: 100,
                        zIndex: 10,
                    }}
                >
                    {/* Channel avatar with follow button */}
                    <Box style={{ position: "relative", marginBottom: 4 }}>
                        <Avatar
                            src="/profile.png"
                            fallback="Z"
                            size="3"
                            radius="full"
                            style={{ border: "2px solid #fff" }}
                        />
                        <Flex
                            align="center"
                            justify="center"
                            style={{
                                position: "absolute",
                                bottom: -8,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "#FE2C55",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                color: "#fff",
                            }}
                        >
                            <IconPlus size={12} />
                        </Flex>
                    </Box>

                    {[
                        { icon: <IconHeart size={26} />, label: "24.1K" },
                        { icon: <IconMessage size={24} />, label: "843" },
                        { icon: <IconBookmark size={24} />, label: "Save" },
                        { icon: <IconShare3 size={24} />, label: "Share" },
                    ].map(({ icon, label }) => (
                        <Flex key={label} direction="column" align="center" gap="1" style={{ cursor: "default" }}>
                            <Box style={{ color: "#fff" }}>{icon}</Box>
                            <Text size="1" style={{ color: "#fff", fontWeight: 600 }}>{label}</Text>
                        </Flex>
                    ))}

                    {/* Spinning disc */}
                    <Box
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #FE2C55 0%, #25F4EE 100%)",
                            border: "3px solid #333",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconMusic size={18} style={{ color: "#fff" }} />
                    </Box>
                </Flex>

                {/* ── Bottom overlay: account + ad copy ─────────────────────── */}
                <Flex
                    direction="column"
                    gap="1"
                    pl="3"
                    pr="9"
                    pb="4"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                        zIndex: 10,
                    }}
                >
                    <Flex align="center" gap="1">
                        <Text size="2" weight="bold" style={{ color: "#fff" }}>@zava_au</Text>
                        <Box
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: 4,
                                padding: "1px 8px",
                                marginLeft: 4,
                            }}
                        >
                            <Text size="1" style={{ color: "#fff" }}>Follow</Text>
                        </Box>
                    </Flex>

                    {/* Sponsored badge */}
                    <Box
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "rgba(254,44,85,0.25)",
                            border: "1px solid rgba(254,44,85,0.6)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            width: "fit-content",
                        }}
                    >
                        <Text size="1" style={{ color: "#FE2C55", fontWeight: 600 }}>Sponsored</Text>
                    </Box>

                    {gen.adText ? (
                        <>
                            {ad.title && (
                                <Text size="2" weight="bold" style={{ color: "#fff", lineHeight: 1.3, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                                    {ad.title}
                                </Text>
                            )}
                            <Text size="1" style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.4, textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
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
                        <IconMusic size={11} style={{ color: "rgba(255,255,255,0.7)" }} />
                        <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Original sound · zava_au</Text>
                    </Flex>
                </Flex>
            </Box>

            {/* ── CTA bar below video ───────────────────────────────────────── */}
            {gen.adText && (
                <Flex
                    align="center"
                    justify="between"
                    px="3"
                    py="2"
                    gap="3"
                    style={{ width: "100%", background: "#111", borderTop: "1px solid #222" }}
                >
                    <Flex direction="column" gap="0" style={{ flex: 1, minWidth: 0 }}>
                        <Text size="1" style={{ color: "#888" }}>zava.com.au</Text>
                        <Text size="2" weight="bold" style={{ color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ad.title || "Shop the latest specials"}
                        </Text>
                    </Flex>
                    <Flex
                        align="center"
                        justify="center"
                        style={{
                            background: "#FE2C55",
                            color: "#fff",
                            borderRadius: 6,
                            padding: "8px 16px 7px 16px",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "default",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                    >
                        {ad.action || "Shop Now"}
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
}
