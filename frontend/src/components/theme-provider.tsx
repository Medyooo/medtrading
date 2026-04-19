import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"
import {
    applyThemeClass,
    resolveInitialTheme,
    type Theme,
    THEME_STORAGE_KEY,
} from "@/lib/themeStorage"

type ThemeContextValue = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme())

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next)
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
            /* ignore */
        }
        applyThemeClass(next)
    }, [])

    useEffect(() => {
        applyThemeClass(theme)
    }, [theme])

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => {
            try {
                const stored = localStorage.getItem(THEME_STORAGE_KEY)
                if (stored === "light" || stored === "dark") return
            } catch {
                /* ignore */
            }
            const next = mq.matches ? "dark" : "light"
            setThemeState(next)
            applyThemeClass(next)
        }
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error("useTheme doit être utilisé dans un ThemeProvider")
    }
    return ctx
}
