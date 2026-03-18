import { Heading, Text, Flex, Box, Strong, Callout } from "@radix-ui/themes";
import { IconPhoto, IconVideo, IconBrush, IconSparkles, IconLayoutGrid, IconInfoCircle } from "@tabler/icons-react";

const CAPABILITIES = [
    {
        icon: IconPhoto,
        title: "AI Image Generation & Editing",
        description: "Generate on-brand marketing images — Instagram posts, Facebook ads, banners, thumbnails and custom formats — from a simple description. Inpainting lets you refine specific regions without regenerating the whole image.",
    },
    {
        icon: IconVideo,
        title: "AI Video Generation & Remix",
        description: "Create short-form marketing videos (Reels, Stories, YouTube Shorts) directly from a prompt. Jobs run asynchronously and completed videos can be remixed to explore iterations.",
    },
    {
        icon: IconBrush,
        title: "Brand Guidelines Enforcement",
        description: "Each format is backed by brand guidelines stored as markdown. Guidelines are automatically injected into every generation prompt to keep outputs consistently on-brand.",
    },
    {
        icon: IconSparkles,
        title: "Copy Generation",
        description: "Alongside every visual, the tool generates suggested ad copy and supporting text that can be iteratively refined to match your campaign message.",
    },
    {
        icon: IconLayoutGrid,
        title: "Asset Library & Projects",
        description: "A centralised asset library spans Brand Assets, Generated Images, and Generated Videos — all stored in Azure Blob Storage. Work is organised into projects, each maintaining a full generation history.",
    },
];

export default function HomeInfo() {
    return (
        <Flex direction="column" align="center" gap="9" px="8" py="9" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

            {/* Problem + Solution two-column */}
            <Flex gap="8" align="start" style={{ width: "100%" }} direction={{ initial: "column", sm: "row" }}>

                <Flex direction="column" gap="4" style={{ flex: 1 }}>
                    <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Problem</Text>
                    <Heading size="5">Marketing teams are bottlenecked by creative production</Heading>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        Brands need to produce hundreds of assets across formats — social posts, ads, banners, video clips — each tailored to platform specs and brand guidelines.
                        Traditional workflows rely on designers and creative agencies, creating weeks-long lead times and spiralling costs.
                        Campaign teams wait for iterations, miss market windows, and struggle to maintain consistency across channels.
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        Meanwhile, AI image and video generation has matured dramatically — but these tools produce generic outputs that ignore brand identity.
                        Marketers are left choosing between speed (off-brand AI) and quality (slow agency work).
                    </Text>
                </Flex>

                <Flex direction="column" gap="4" style={{ flex: 1 }}>
                    <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Solution</Text>
                    <Heading size="5">AI-powered, on-brand creative at the speed of thought</Heading>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        <Strong>Zava Marketing Studio</Strong> combines Azure OpenAI&apos;s latest image and video models with embedded brand guidelines.
                        Every generation is automatically shaped by your brand&apos;s voice, colours, and style — no manual prompt engineering required.
                        Teams describe what they want in plain language, iterate with inpainting and remix tools, and export production-ready assets in minutes.
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        The platform is project-based: each campaign maintains its own history of generations, making it easy to explore variations, compare outputs, and track creative evolution.
                        All assets flow into a centralised library backed by Azure Blob Storage, ready for reuse across campaigns.
                    </Text>
                </Flex>

            </Flex>

            {/* Core Capabilities */}
            <Flex direction="column" align="center" gap="4" style={{ width: "100%" }}>
                <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Core Capabilities</Text>
                <Flex gap="4" wrap="wrap" justify="center" style={{ width: "100%" }}>
                    {CAPABILITIES.map((cap) => (
                        <Box key={cap.title} style={{ flex: "1 1 280px", maxWidth: 340 }}>
                            <Flex direction="column" gap="2" p="4" style={{ background: "var(--gray-a2)", borderRadius: "var(--radius-3)", height: "100%" }}>
                                <Flex align="center" gap="2">
                                    <cap.icon size={20} style={{ color: "var(--accent-9)", flexShrink: 0 }} />
                                    <Text size="2" weight="bold">{cap.title}</Text>
                                </Flex>
                                <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>{cap.description}</Text>
                            </Flex>
                        </Box>
                    ))}
                </Flex>
            </Flex>

            {/* Technical Stack + Easy Reskinning two-column */}
            <Flex gap="8" align="start" style={{ width: "100%" }} direction={{ initial: "column", sm: "row" }}>

                <Flex direction="column" gap="4" style={{ flex: 1 }}>
                    <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical Stack</Text>
                    <Heading size="5">Built on Azure, end to end</Heading>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        Built on <Strong>Next.js</Strong> (frontend) and <Strong>Express</Strong> (backend), both hosted on Azure App Service.
                        Image generation uses <Strong>GPT-Image-1</Strong>; video generation uses <Strong>Sora 2</Strong> via Azure OpenAI.
                        Assets are stored in <Strong>Azure Blob Storage</Strong> with <Strong>Entra ID / Managed Identity</Strong> authentication throughout.
                    </Text>
                    <Callout.Root size="2" mt="1">
                        <Callout.Icon><IconInfoCircle size={16} /></Callout.Icon>
                        <Callout.Text>Projects are personal — the app starts blank. Create your own projects to see results.</Callout.Text>
                    </Callout.Root>
                </Flex>

                <Flex direction="column" gap="4" style={{ flex: 1 }}>
                    <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Easy Reskinning</Text>
                    <Heading size="5">White-label ready, adapt to any brand</Heading>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        The platform is designed for easy customisation. Swap out the logo, update the colour palette via Radix UI theme tokens, and replace brand assets in the <Strong>/public</Strong> folder — you&apos;ll have a fully rebranded studio in minutes.
                        Brand guidelines are stored as editable markdown files, making it simple to tailor AI outputs to any client or industry.
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.8 }}>
                        Whether you&apos;re demoing for retail, hospitality, finance or any other vertical, the codebase is structured to make reskinning straightforward.
                        Fork the repo, update a handful of config files and assets, and deploy your own version — no deep refactoring required.
                    </Text>
                </Flex>

            </Flex>

            {/* Demo video */}
            <Flex direction="column" align="center" gap="4" style={{ width: "100%" }}>
                <Text size="2" weight="bold" style={{ color: "var(--accent-9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product Demo</Text>
                <Heading size="5" align="center">See the studio in action</Heading>
                <Box mt="2" style={{ width: "100%", maxWidth: 900, borderRadius: "var(--radius-4)", overflow: "hidden", background: "#000" }}>
                    <div style={{ padding: "64.4% 0 0 0", position: "relative" }}>
                        <iframe
                            src="https://player.vimeo.com/video/1173850713?badge=0&autopause=0&player_id=0&app_id=58479"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                            title="Zava Marketing Studio"
                        />
                    </div>
                </Box>
            </Flex>

        </Flex>
    );
}
