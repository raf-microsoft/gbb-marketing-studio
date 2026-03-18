import { Flex, Box, Card, Text, Spinner, Avatar } from "@radix-ui/themes";
import {
    IconHeart,
    IconMessageCircle,
    IconSend,
    IconBookmark,
    IconDots,
} from "@tabler/icons-react";
import { parseAdText } from "@/lib/adText";

export default function InstagramAd({ img, index, onImageClick }) {
    const ad = parseAdText(img.adText);
    const isLoading = !img.adText;
    return (
        <Card style={{ width: 468, padding: 0, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            {/* Header */}
            <Flex align="center" justify="between" px="3" py="2">
                <Flex align="center" gap="2">
                    <Avatar
                        src="/profile.png"
                        fallback="C"
                        size="2"
                        radius="full"
                    />
                    <Flex direction="column" gap="0">
                        <Text size="2" weight="bold" style={{ lineHeight: 1.2 }}>zavamarket</Text>
                        <Text size="1" color="gray" style={{ lineHeight: 1.2 }}>Sponsored</Text>
                    </Flex>
                </Flex>
                <IconDots size={20} style={{ color: "var(--gray-11)", cursor: "default" }} />
            </Flex>

            {/* Image */}
            <Box style={{ cursor: "zoom-in", lineHeight: 0 }} onClick={onImageClick}>
                <img
                    src={img.url}
                    alt={`Generated image ${index + 1}`}
                    style={{ width: "100%", height: "auto", display: "block" }}
                />
            </Box>

            {/* Action row */}
            <Flex align="center" justify="between" px="3" pt="3" pb="1">
                <Flex align="center" gap="3">
                    <IconHeart size={26} style={{ color: "var(--gray-12)", cursor: "default" }} />
                    <IconMessageCircle size={26} style={{ color: "var(--gray-12)", cursor: "default" }} />
                    <IconSend size={24} style={{ color: "var(--gray-12)", cursor: "default" }} />
                </Flex>
                <IconBookmark size={26} style={{ color: "var(--gray-12)", cursor: "default" }} />
            </Flex>

            {/* Likes */}
            <Box px="3" pb="1">
                <Text size="2" weight="bold">1,204 likes</Text>
            </Box>

            {/* Caption / ad copy */}
            <Box px="3" pb="1">
                {isLoading ? (
                    <Flex align="center" gap="2" style={{ height: 32 }}>
                        <Spinner size="1" />
                        <Text size="1" color="gray">Writing caption…</Text>
                    </Flex>
                ) : (
                    <Text size="2" style={{ lineHeight: 1.5 }}>
                        <Text weight="bold">zavamarket </Text>
                        {ad.body}
                    </Text>
                )}
            </Box>

            {/* Comments + timestamp */}
            <Box px="3" pb="2">
                <Text size="1" color="gray" style={{ display: "block" }}>View all 57 comments</Text>
                <Text size="1" color="gray" style={{ display: "block", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 10 }}>1 day ago</Text>
            </Box>
        </Card>
    );
}
