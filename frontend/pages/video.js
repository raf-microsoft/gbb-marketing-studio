import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { Flex, Box, Text, Heading, Button, Card, Badge, Dialog, TextField } from "@radix-ui/themes";
import { IconVideo, IconPlus, IconTrash, IconClock } from "@tabler/icons-react";
import useVideoStore from "@/store/useVideoStore";

const GUIDELINE_LABELS = {
    "facebook-reel": "Facebook Reel",
    "instagram-story": "Instagram Story",
    "youtube-short": "YouTube Short",
    banner: "Banner",
    custom: "Custom",
};

const STATUS_COLOR = {
    queued: "gray",
    in_progress: "gray",
    completed: "green",
    failed: "red",
};

function ProjectCard({ project, onOpen, onDelete }) {
    const lastGen = project.generations[0];
    const genCount = project.generations.length;

    return (
        <Card
            style={{ width: 360, padding: 0, overflow: "hidden", cursor: "pointer" }}
            onClick={onOpen}
        >
            {/* Thumbnail */}
            <Box style={{ width: "100%", aspectRatio: "16/9", background: "var(--gray-3)", overflow: "hidden", position: "relative" }}>
                {lastGen?.url ? (
                    <video
                        src={lastGen.url}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        muted
                        playsInline
                    />
                ) : (
                    <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
                        <IconVideo size={32} style={{ color: "var(--gray-7)" }} />
                    </Flex>
                )}
                {lastGen?.status && lastGen.status !== "completed" && (
                    <Badge
                        color={STATUS_COLOR[lastGen.status] ?? "gray"}
                        variant="solid"
                        size="1"
                        style={{ position: "absolute", top: 8, right: 8 }}
                    >
                        {lastGen.status}
                    </Badge>
                )}
            </Box>

            {/* Info */}
            <Flex direction="column" gap="2" p="3">
                <Flex align="center" justify="between" gap="2">
                    <Text size="2" weight="bold" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.name}
                    </Text>
                    <Badge variant="soft" size="1">
                        {GUIDELINE_LABELS[project.guideline] ?? project.guideline}
                    </Badge>
                </Flex>

                <Flex align="center" justify="between">
                    <Flex align="center" gap="1">
                        <IconClock size={12} style={{ color: "var(--gray-9)" }} />
                        <Text size="1" color="gray">
                            {new Date(project.createdAt).toLocaleDateString()}
                        </Text>
                    </Flex>
                    <Text size="1" color="gray">
                        {genCount} generation{genCount !== 1 ? "s" : ""}
                    </Text>
                </Flex>

                <Flex gap="2" mt="1">
                    <Button
                        style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); onOpen(); }}
                    >
                        Open
                    </Button>
                    <Button
                        variant="soft"
                        color="gray"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <IconTrash size={16} />
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
}

export default function VideoListPage() {
    const router = useRouter();
    const { projects, createProject, deleteProject } = useVideoStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");

    const handleCreate = () => {
        const name = newName.trim() || `Video Project ${new Date().toLocaleDateString()}`;
        const id = createProject(name);
        setNewName("");
        setDialogOpen(false);
        router.push(`/video/${id}`);
    };

    return (
        <Layout>
            <Flex direction="column" gap="6" className="p-6 h-full">
                <Flex direction="column" gap="2">
                    <Flex align="center" justify="between">
                        <Flex align="center" gap="2">
                            <IconVideo size={24} className="accent" />
                            <Heading size="5">Video</Heading>
                        </Flex>
                        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                            <Dialog.Trigger>
                                <Button size="2">
                                    <IconPlus size={16} />
                                    New Project
                                </Button>
                            </Dialog.Trigger>
                            <Dialog.Content maxWidth="400px">
                                <Dialog.Title>New Video Project</Dialog.Title>
                                <Dialog.Description size="2" mb="4" color="gray">
                                    Give your project a name to get started.
                                </Dialog.Description>
                                <Flex direction="column" gap="3">
                                    <TextField.Root
                                        placeholder="Project name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                        autoFocus
                                    />
                                    <Flex gap="2" justify="end">
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                        </Dialog.Close>
                                        <Button onClick={handleCreate}>Create</Button>
                                    </Flex>
                                </Flex>
                            </Dialog.Content>
                        </Dialog.Root>
                    </Flex>
                    <Text size="2" color="gray">Create and manage video generation projects.</Text>
                </Flex>

                {projects.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" gap="3" style={{ flex: 1 }}>
                        <IconVideo size={48} style={{ color: "var(--gray-6)" }} />
                        <Text size="2" color="gray">No projects yet. Create your first one!</Text>
                    </Flex>
                ) : (
                    <Flex wrap="wrap" gap="4" align="start">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onOpen={() => router.push(`/video/${project.id}`)}
                                onDelete={() => deleteProject(project.id)}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        </Layout>
    );
}
