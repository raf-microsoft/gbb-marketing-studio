import { create } from "zustand";
import { persist } from "zustand/middleware";

const uuid = () => crypto.randomUUID();

export const DEFAULT_SETTINGS = {
    prompt: "",
    guideline: "facebook-reel",
    model: "sora-2",
    size: "720x1280",
    seconds: "4",
    selectedAsset: null, // filename from samples (for image-to-video)
};

// Generation shape:
// { id, createdAt, jobId, status, url, blobName, prompt }
// status: "queued" | "in_progress" | "completed" | "failed"

const useVideoStore = create(
    persist(
        (set) => ({
            projects: [],

            createProject: (name) => {
                const id = uuid();
                set((state) => ({
                    projects: [
                        ...state.projects,
                        {
                            id,
                            name,
                            createdAt: new Date().toISOString(),
                            ...DEFAULT_SETTINGS,
                            generations: [],
                        },
                    ],
                }));
                return id;
            },

            updateProjectSettings: (projectId, settings) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId ? { ...p, ...settings } : p
                    ),
                })),

            addGeneration: (projectId, generation) => {
                const id = uuid();
                const fullGen = { id, createdAt: new Date().toISOString(), ...generation };
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        return {
                            ...p,
                            generations: [fullGen, ...p.generations],
                        };
                    }),
                }));
                return id;
            },

            updateGeneration: (projectId, generationId, updates) =>
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        return {
                            ...p,
                            generations: p.generations.map((g) =>
                                g.id === generationId ? { ...g, ...updates } : g
                            ),
                        };
                    }),
                })),

            deleteGeneration: (projectId, generationId) =>
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        return {
                            ...p,
                            generations: p.generations.filter((g) => g.id !== generationId),
                        };
                    }),
                })),

            deleteProject: (projectId) =>
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== projectId),
                })),
        }),
        {
            name: "zava-video-projects",
            partialize: (state) => ({
                projects: state.projects.map((p) => ({
                    ...p,
                    // Drop in-flight or failed generations that have no blob URL
                    generations: p.generations.filter(
                        (g) => g.status === "completed" && g.url
                    ),
                })),
            }),
        }
    )
);

export default useVideoStore;
