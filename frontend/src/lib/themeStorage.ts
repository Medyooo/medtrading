export const THEME_STORAGE_KEY = "medtrading-theme"

export type Theme = "light" | "dark"

export function getStoredTheme(): Theme | null {
    try {
        const v = localStorage.getItem(THEME_STORAGE_KEY)
        if (v === "light" || v === "dark") return v
    } catch {
        /* private mode or blocked storage */
    }
    return null
}

export function getSystemTheme(): Theme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

export function resolveInitialTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme()
}

export function applyThemeClass(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light"
}
