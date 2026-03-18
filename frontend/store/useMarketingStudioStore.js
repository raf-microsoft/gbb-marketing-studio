import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMarketingStudioStore = create(
    persist(
        (set) => ({
            accentColor: "gold",
            grayColor: "sage",
            radius: "large",
            assetView: "grid",
            setAccentColor: (accentColor) => set({ accentColor }),
            setGrayColor: (grayColor) => set({ grayColor }),
            setRadius: (radius) => set({ radius }),
            setAssetView: (assetView) => set({ assetView }),
        }),
        { name: "marketing-studio-settings" }
    )
);

export default useMarketingStudioStore;
