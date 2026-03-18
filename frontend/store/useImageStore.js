import { create } from "zustand";
import { persist } from "zustand/middleware";

const uuid = () => crypto.randomUUID();

export const DEFAULT_SETTINGS = {
    guideline: "facebook-ad",
    prompt: "",
    model: "gpt-image-1.5",
    size: "1536x1024",
    format: "png",
    quality: "High",
    background: "Auto",
    variations: "1",
    selectedAssets: [],
};

const useImageStore = create(
    persist(
        (set) => ({
            projects: [],

            // Transient (not persisted)
            isGenerating: false,
            error: null,

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

            addGeneration: (projectId, images, meta = {}) => {
                const id = uuid();
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        return {
                            ...p,
                            generations: [
                                { id, createdAt: new Date().toISOString(), images, ...meta },
                                ...p.generations,
                            ],
                        };
                    }),
                }));
                return id;
            },

            updateImageAdText: (projectId, generationId, imageIndex, adText) =>
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        return {
                            ...p,
                            generations: p.generations.map((g) => {
                                if (g.id !== generationId) return g;
                                const images = [...g.images];
                                images[imageIndex] = { ...images[imageIndex], adText };
                                return { ...g, images };
                            }),
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

            deleteImage: (projectId, generationId, imageIndex) =>
                set((state) => ({
                    projects: state.projects.map((p) => {
                        if (p.id !== projectId) return p;
                        const generations = p.generations
                            .map((g) => {
                                if (g.id !== generationId) return g;
                                const images = g.images.filter((_, i) => i !== imageIndex);
                                return images.length === 0 ? null : { ...g, images };
                            })
                            .filter(Boolean);
                        return { ...p, generations };
                    }),
                })),

            deleteProject: (projectId) =>
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== projectId),
                })),

            setGenerating: (val) => set({ isGenerating: val }),
            setError: (error) => set({ error }),
        }),
        {
            name: "zava-image-projects",
            partialize: (state) => ({
                projects: state.projects.map((p) => ({
                    ...p,
                    generations: p.generations
                        .map((g) => ({
                            ...g,
                            images: g.images.filter(
                                (img) => img.url && !img.url.startsWith("data:")
                            ),
                        }))
                        .filter((g) => g.images.length > 0),
                })),
            }),
        }
    )
);

export default useImageStore;
