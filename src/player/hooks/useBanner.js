import { useState } from "react";

export default function useBanner() {
    const [banner, setBannerState] = useState({ text: "", type: "info" });

    const setBanner = (text, type = "info") => setBannerState({ text, type });
    const clearBanner = () => setBannerState({ text: "", type: "info" });

    return { banner, setBanner, clearBanner };
}
