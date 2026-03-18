import { useEffect, useRef, useCallback } from "react";

export default function useLightbox(sources = [], galleryName = "gallery") {
    const containerRef = useRef(null);
    const sourcesKey = sources.join(",");

    useEffect(() => {
        if (!sourcesKey) return;
        import("fslightbox").then(() => {
            if (typeof window !== "undefined" && window.refreshFsLightbox) {
                window.refreshFsLightbox();
            }
        });
    }, [sourcesKey]);

    const open = useCallback(
        (index = 0) => {
            if (!containerRef.current) return;
            const links = containerRef.current.querySelectorAll(
                `[data-fslightbox="${galleryName}"]`
            );
            if (links[index]) links[index].click();
        },
        [galleryName]
    );

    return { open, containerRef, galleryName };
}
