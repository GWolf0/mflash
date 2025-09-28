"use client";

import { useEffect, useState, ReactNode } from "react";
import ThemeService, { ThemeType } from "@/services/systems/themeService";

export default function ThemeInitializer({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Initialize theme
        const theme: ThemeType = ThemeService.loadCurrentTheme(); 
        ThemeService.toggleTheme(theme === "dark" ? "dark" : "light");
        
        setReady(true);
    }, []);

    if (!ready) return null; // or a loader

    return <>{children}</>;
}