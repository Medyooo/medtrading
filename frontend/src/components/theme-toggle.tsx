import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
    className?: string
    /** `floating` : contrôle flottant type « verre » pour les pages plein écran (login, landing). */
    variant?: "default" | "floating"
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()
    const isDark = theme === "dark"

    if (variant === "floating") {
        return (
            <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
                className={cn(
                    "relative flex size-11 items-center justify-center rounded-full sm:size-12",
                    "border border-emerald-200/90 bg-white/80 text-emerald-800 shadow-lg shadow-emerald-900/10",
                    "backdrop-blur-xl backdrop-saturate-150 transition-all duration-200",
                    "hover:border-emerald-300 hover:bg-white/95 hover:text-emerald-900 hover:shadow-xl hover:shadow-emerald-900/12",
                    "active:scale-[0.96]",
                    "focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                    "dark:border-emerald-500/35 dark:bg-zinc-950/75 dark:text-emerald-200 dark:shadow-black/50",
                    "dark:hover:border-emerald-400/50 dark:hover:bg-zinc-900/82 dark:hover:text-emerald-100 dark:hover:shadow-emerald-950/30",
                    "dark:focus-visible:ring-emerald-400/55 dark:focus-visible:ring-offset-zinc-950",
                    className,
                )}
            >
                {isDark ? (
                    <Sun className="relative size-[1.15rem] shrink-0 sm:size-5" aria-hidden />
                ) : (
                    <Moon className="relative size-[1.15rem] shrink-0 sm:size-5" aria-hidden />
                )}
            </button>
        )
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={cn(className)}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
        >
            {isDark ? (
                <Sun className="size-4 shrink-0" aria-hidden />
            ) : (
                <Moon className="size-4 shrink-0" aria-hidden />
            )}
        </Button>
    )
}
