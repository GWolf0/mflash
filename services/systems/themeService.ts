/**
 * Theme service
 * - handles theme related logic
 */

export default class ThemeService {
    static SAVE_KEY = "theme";
    static currentTheme: ThemeService;

    // toggle/set theme type
    static toggleTheme(value?: ThemeType) {
        if (!window) return;

        const isDark = ThemeService.isDarkTheme();
        value = value ?? (isDark ? "light" : "dark");

        if (value === "light") document.documentElement.classList.remove("dark");
        else document.documentElement.classList.add("dark");

        ThemeService.saveTheme(value);
    }

    // assume dark theme if dark class on document element
    static isDarkTheme(): boolean {
        return document.documentElement.classList.contains("dark");
    }

    // load current theme from ls
    static loadCurrentTheme(): ThemeType {
        if (!window) return ThemeService.getDefaultTheme();

        const savedValue = localStorage.getItem(ThemeService.SAVE_KEY);
        if (savedValue) return savedValue as ThemeType;
        return ThemeService.getDefaultTheme();
    }

    // save theme to ls
    static saveTheme(value: ThemeType) {
        localStorage.setItem(ThemeService.SAVE_KEY, value.toString());
    }

    // get default theme
    static getDefaultTheme(): ThemeType {
        if(!window) return "light";

        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
        return "light";
    }

}

export type ThemeType = "dark" | "light";