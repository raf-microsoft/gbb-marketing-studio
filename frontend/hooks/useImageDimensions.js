import { useState, useEffect } from "react";

/**
 * Given an array of image src URLs, loads each image in the browser and
 * returns a map of { [src]: { width, height } }.
 * Results accumulate incrementally as each image loads.
 */
export default function useImageDimensions(srcs = []) {
    const [dimensions, setDimensions] = useState({});

    useEffect(() => {
        if (!srcs.length) return;

        srcs.forEach((src) => {
            setDimensions((prev) => {
                if (prev[src]) return prev; // already loaded
                const img = new window.Image();
                img.onload = () => {
                    setDimensions((p) => ({
                        ...p,
                        [src]: { width: img.naturalWidth, height: img.naturalHeight },
                    }));
                };
                img.src = src;
                return prev;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [srcs.join(",")]);

    return dimensions;
}
