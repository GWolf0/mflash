export default class ThemeService {
    static SAVE_KEY = "theme";
    static currentTheme: ThemeService;

    static toggleTheme(value?: ThemeType) {
        if (!window) return;

        const isDark = ThemeService.isDarkTheme();
        value = value ?? (isDark ? "light" : "dark");

        if (value === "light") document.documentElement.classList.remove("dark");
        else document.documentElement.classList.add("dark");

        ThemeService.saveTheme(value);
    }

    static isDarkTheme(): boolean {
        return document.documentElement.classList.contains("dark");
    }

    static loadCurrentTheme(): ThemeType {
        if (!window) return ThemeService.getDefaultTheme();

        const savedValue = localStorage.getItem(ThemeService.SAVE_KEY);
        if (savedValue) return savedValue as ThemeType;
        return ThemeService.getDefaultTheme();
    }

    static saveTheme(value: ThemeType) {
        localStorage.setItem(ThemeService.SAVE_KEY, value.toString());
    }

    static getDefaultTheme(): ThemeType {
        if(!window) return "light";

        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
        return "light";
    }

}

export type ThemeType = "dark" | "light";