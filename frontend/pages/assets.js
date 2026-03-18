import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import {
    Heading, Text, Flex, Box, Tabs, Badge,
    Button, Callout, Spinner,
} from "@radix-ui/themes";
import { IconStack2, IconPhoto, IconVideo, IconTrash } from "@tabler/icons-react";
import { toast } from "react-toastify";
import useSamples from "@/hooks/useSamples";
import useLightbox from "@/hooks/useLightbox";
import DeleteAssetDialog from "@/components/dialogs/DeleteAssetDialog";
import AssetsBrandItem from "@/components/assets/AssetsBrandItem";
import AssetsImageItem from "@/components/assets/AssetsImageItem";
import AssetsVideoItem from "@/components/assets/AssetsVideoItem";

function useGeneratedImages() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        setLoading(true);
        fetch('/api/image/list')
            .then(r => r.json())
            .then(d => setImages(d.images || []))
            .catch(() => setImages([]))
            .finally(() => setLoading(false));
    }, [version]);
    const refresh = useCallback(() => setVersion(v => v + 1), []);
    return { images, loading, refresh };
}

function useGeneratedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        setLoading(true);
        fetch('/api/video/list')
            .then(r => r.json())
            .then(d => setVideos(d.videos || []))
            .catch(() => setVideos([]))
            .finally(() => setLoading(false));
    }, [version]);
    const refresh = useCallback(() => setVersion(v => v + 1), []);
    return { videos, loading, refresh };
}

// ─── Grids ───────────────────────────────────────────────────────────────────

function AssetGrid({ samples, loading, onDelete, selectedIds, onToggle }) {
    const { containerRef, galleryName } = useLightbox(
        samples.map((s) => s.src),
        "assets"
    );

    if (loading) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: 12,
                }}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <Box
                        key={i}
                        style={{
                            borderRadius: "var(--radius-3)",
                            overflow: "hidden",
                            aspectRatio: "4/3",
                            background: "var(--gray-a3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Flex align="center" justify="center">
                            <Spinner size="3" />
                        </Flex>
                    </Box>
                ))}
            </div>
        );
    }

    if (!samples.length) {
        return <Text size="2" color="gray">No assets found.</Text>;
    }

    return (
        <div
            ref={containerRef}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: 12,
            }}
        >
            {samples.map((s) => (
                <AssetsBrandItem
                    key={s.id}
                    sample={s}
                    galleryName={galleryName}
                    isSelected={selectedIds?.includes(s.id)}
                    onDelete={onDelete}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}

function GeneratedImagesGrid({ allImages, loading, isLocalhost, onDelete }) {
    const { containerRef, galleryName } = useLightbox(
        allImages.map((i) => i.url),
        "generated-images"
    );

    if (loading) return null;
    if (!allImages.length) {
        return <Text size="2" color="gray">No generated images yet.</Text>;
    }

    return (
        <div
            ref={containerRef}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
            }}
        >
            {allImages.map((item, i) => (
                <AssetsImageItem
                    key={`${item.name}-${i}`}
                    item={item}
                    galleryName={galleryName}
                    isLocalhost={isLocalhost}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

function GeneratedVideosGrid({ allVideos, loading, isLocalhost, onDelete }) {
    if (loading) return null;
    if (!allVideos.length) {
        return <Text size="2" color="gray">No generated videos yet.</Text>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
            }}
        >
            {allVideos.map((item, i) => (
                <AssetsVideoItem
                    key={`${item.name}-${i}`}
                    item={item}
                    isLocalhost={isLocalhost}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
    const { samples, loading: samplesLoading, refresh } = useSamples();
    const { images: allImages, loading: imagesLoading, refresh: refreshImages } = useGeneratedImages();
    const { videos: allVideos, loading: videosLoading, refresh: refreshVideos } = useGeneratedVideos();
    const [selectedAssetIds, setSelectedAssetIds] = useState([]);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'single' | 'multiple', id: string | null }
    useEffect(() => { setIsLocalhost(window.location.hostname === 'localhost'); }, []);

    function toggleAsset(id) {
        setSelectedAssetIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    async function handleDeleteAsset(id) {
        setDeleteConfirm({ type: 'single', id });
    }

    async function confirmDeleteAsset() {
        if (!deleteConfirm?.id) return;
        try {
            const res = await fetch("/api/assets/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blobName: deleteConfirm.id }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setSelectedAssetIds((prev) => prev.filter((x) => x !== deleteConfirm.id));
            toast.success("Asset deleted.");
            refresh();
        } catch (err) {
            toast.error("Delete failed: " + err.message);
        } finally {
            setDeleteConfirm(null);
        }
    }

    async function handleDeleteImage(name) {
        try {
            const res = await fetch("/api/image/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blobNames: [name] }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success("Image deleted.");
            refreshImages();
        } catch (err) {
            toast.error("Delete failed: " + err.message);
        }
    }

    async function handleDeleteVideo(name) {
        try {
            const res = await fetch("/api/video/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blobName: name }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success("Video deleted.");
            refreshVideos();
        } catch (err) {
            toast.error("Delete failed: " + err.message);
        }
    }

    async function handleDeleteSelected() {
        if (!selectedAssetIds.length) return;
        setDeleteConfirm({ type: 'multiple', id: null });
    }

    async function confirmDeleteSelected() {
        if (!selectedAssetIds.length) return;
        let failed = 0;
        for (const id of selectedAssetIds) {
            try {
                const res = await fetch("/api/assets/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ blobName: id }),
                });
                if (!res.ok) throw new Error();
            } catch {
                failed++;
            }
        }
        const count = selectedAssetIds.length;
        setSelectedAssetIds([]);
        refresh();
        setDeleteConfirm(null);
        if (failed) toast.error(`${failed} deletion(s) failed.`);
        else toast.success(`${count} asset(s) deleted.`);
    }

    return (
        <Layout>
            <Flex direction="column" gap="6" className="p-6 h-full">
                <Flex align="center" gap="2">
                    <IconStack2 size={24} className="accent" />
                    <Heading size="5">Assets</Heading>
                </Flex>

                <Tabs.Root defaultValue="assets">
                    <Tabs.List>
                        <Tabs.Trigger value="assets">
                            <Flex align="center" gap="1">
                                <IconStack2 size={14} />
                                Brand
                                <Badge size="1" variant="soft" color="gray" ml="1">{samples.length}</Badge>
                            </Flex>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="images">
                            <Flex align="center" gap="1">
                                <IconPhoto size={14} />
                                Generated Images
                                <Badge size="1" variant="soft" color="gray" ml="1">{allImages.length}</Badge>
                            </Flex>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="videos">
                            <Flex align="center" gap="1">
                                <IconVideo size={14} />
                                Generated Videos
                                <Badge size="1" variant="soft" color="gray" ml="1">{allVideos.length}</Badge>
                            </Flex>
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Box pt="4">
                        <Tabs.Content value="assets">
                            {selectedAssetIds.length > 0 && (
                                <Callout.Root color="gray" variant="soft" mb="3" style={{ display: "flex", alignItems: "center" }}>
                                    <Callout.Icon>
                                        <IconTrash size={16} />
                                    </Callout.Icon>
                                    <Flex align="center" justify="between" style={{ flex: 1 }}>
                                        <Text size="2">
                                            {selectedAssetIds.length} asset{selectedAssetIds.length > 1 ? "s" : ""} selected
                                        </Text>
                                        <Button size="1" color="gray" variant="solid" onClick={handleDeleteSelected}>
                                            Delete selected
                                        </Button>
                                    </Flex>
                                </Callout.Root>
                            )}
                            <AssetGrid
                                samples={samples}
                                loading={samplesLoading}
                                onDelete={handleDeleteAsset}
                                selectedIds={selectedAssetIds}
                                onToggle={toggleAsset}
                            />
                        </Tabs.Content>

                        <Tabs.Content value="images">
                            <GeneratedImagesGrid allImages={allImages} loading={imagesLoading} isLocalhost={isLocalhost} onDelete={handleDeleteImage} />
                        </Tabs.Content>

                        <Tabs.Content value="videos">
                            <GeneratedVideosGrid allVideos={allVideos} loading={videosLoading} isLocalhost={isLocalhost} onDelete={handleDeleteVideo} />
                        </Tabs.Content>
                    </Box>
                </Tabs.Root>
            </Flex>

            <DeleteAssetDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
                onConfirm={deleteConfirm?.type === 'multiple' ? confirmDeleteSelected : confirmDeleteAsset}
                count={deleteConfirm?.type === 'multiple' ? selectedAssetIds.length : 1}
            />
        </Layout>
    );
}
