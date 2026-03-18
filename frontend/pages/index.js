import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import HomeInfo from "@/components/HomeInfo";
import { Heading, Text, Flex, Box, Card, Inset, Strong, Spinner } from "@radix-ui/themes";
import { IconPhoto, IconStack2, IconVideo } from "@tabler/icons-react";

const CAMPAIGN_TYPES = [
  {
    label: "Social media ad",
    description: "Create thumb-stopping social ads tailored to Facebook, Instagram and more.",
    icon: IconPhoto,
    href: "/image",
    img: "/images/zava-1.png",
  },
  {
    label: "Online store ad",
    description: "Design product-focused ads optimised for e-commerce and online promotions.",
    icon: IconStack2,
    href: "/image",
    img: "/images/zava-2.png",
  },
  {
    label: "Video campaign",
    description: "Generate short-form video ads for Reels, Stories and YouTube Shorts.",
    icon: IconVideo,
    href: "/video",
    img: "/images/zava-3.png",
  },
];

function GenerationCard({ url, loading }) {
  return (
    <Box style={{ flex: "1 1 0", minWidth: 0 }}>
      <Box
        style={{
          aspectRatio: "4/3",
          borderRadius: "var(--radius-3)",
          overflow: "hidden",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        {loading ? (
          <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
            <Spinner size="3" />
          </Flex>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Latest generation"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
            <IconPhoto size={36} color="rgba(255,255,255,0.3)" />
          </Flex>
        )}
      </Box>
    </Box>
  );
}

export default function Home() {
  const [latestImages, setLatestImages] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    fetch("/api/latest-generations")
      .then((r) => r.json())
      .then((data) => setLatestImages(data.images ?? []))
      .catch(() => { })
      .finally(() => setLoadingLatest(false));
  }, []);

  return (
    <Layout>
      <Flex direction="column" className="flex-1 overflow-y-auto">
        {/* Hero */}
        <Flex p="9" direction="column" justify="center" style={{
          backgroundImage: "url('/hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: 400,
        }}>
          <Flex direction="column" align="center" gap="4">
            <Heading size="8" align="center" style={{ color: "var(--accent-12)" }}>
              Welcome to Zava AI marketing studio
            </Heading>
            <Text size="2" align="center" style={{ color: "var(--accent-11)" }}>Latest generations:</Text>
            <Flex gap="3" style={{ width: "100%", maxWidth: 900 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <GenerationCard
                  key={i}
                  loading={loadingLatest}
                  url={latestImages[i]?.url}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>

        {/* Features Section */}
        <Box
          py="9"
          px="8"
          className="features-pattern">
          <Flex direction="column" align="center" gap="6" style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Heading size="6" align="center" style={{ color: "white" }}>
              AI-Powered Marketing Made Simple
            </Heading>
            <Flex gap="6" direction={{ initial: "column", sm: "row" }} style={{ width: "100%" }}>
              <Box style={{ flex: 1 }}>
                <Flex direction="column" gap="3" align="center">
                  <IconPhoto size={48} color="white" />
                  <Heading size="4" align="center" style={{ color: "white" }}>
                    Generate Images
                  </Heading>
                  <Text align="center" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Create stunning marketing visuals in seconds with AI. Perfect for social media, ads, and promotional content.
                  </Text>
                </Flex>
              </Box>
              <Box style={{ flex: 1 }}>
                <Flex direction="column" gap="3" align="center">
                  <IconVideo size={48} color="white" />
                  <Heading size="4" align="center" style={{ color: "white" }}>
                    Create Videos
                  </Heading>
                  <Text align="center" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Generate engaging video content for Reels, Stories, and YouTube Shorts automatically with AI assistance.
                  </Text>
                </Flex>
              </Box>
              <Box style={{ flex: 1 }}>
                <Flex direction="column" gap="3" align="center">
                  <IconStack2 size={48} color="white" />
                  <Heading size="4" align="center" style={{ color: "white" }}>
                    Manage Assets
                  </Heading>
                  <Text align="center" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Organize and access all your marketing materials in one place. Keep your campaigns streamlined and efficient.
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Box>

        {/* Campaign types */}
        <Flex direction="column" align="center" gap="5" px="8" py="8">
          <Heading size="6" align="center" mb="4">
            Generate an ad or marketing campaign
          </Heading>
          <Flex gap="4" style={{ width: "100%", maxWidth: 1000 }}>
            {CAMPAIGN_TYPES.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                style={{ flex: "1 1 0", minWidth: 0, textDecoration: "none" }}
              >
                <Card size="2" style={{ cursor: "pointer", height: "100%" }}>
                  <Inset clip="padding-box" side="top" pb="current">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.img}
                      alt={c.label}
                    />
                  </Inset>
                  <Text as="p" size="3">
                    <Strong>{c.label}</Strong>
                  </Text>
                  <Text as="p" size="2" color="gray" mt="1">
                    {c.description}
                  </Text>
                </Card>
              </Link>
            ))}
          </Flex>
        </Flex>

        {/* Info section */}
        <HomeInfo />

        {/* Footer */}
        <Box py="4">
          <Footer />
        </Box>
      </Flex>
    </Layout>
  );
}
