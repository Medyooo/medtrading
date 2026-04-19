import { LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export type AppHeaderProps = {
    className?: string
    subtitle?: string
    size?: "sm" | "md"
    placement?: "static" | "sticky" | "fixed"
    themeToggleVariant?: "default" | "floating"
}

const boxClass: Record<NonNullable<AppHeaderProps["size"]>, string> = {
    sm: "size-10 rounded-lg",
    md: "size-11 rounded-xl",
}

const iconClass: Record<NonNullable<AppHeaderProps["size"]>, string> = {
    sm: "size-[18px]",
    md: "size-5",
}

const titleClass: Record<NonNullable<AppHeaderProps["size"]>, string> = {
    sm: "text-base",
    md: "text-lg",
}

export function AppHeader({
    className,
    subtitle,
    size = "md",
    placement = "static",
    themeToggleVariant = "default",
}: AppHeaderProps) {
    const row = (
        <div
            className={cn(
                "flex h-16 w-full items-center justify-between gap-4 sm:h-[4.25rem]",
                placement !== "static" &&
                    "mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 xl:px-16",
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-center bg-emerald-600 text-white shadow-md",
                        "ring-1 ring-emerald-950/20 dark:bg-emerald-500 dark:shadow-black/30 dark:ring-white/15",
                        boxClass[size],
                    )}
                    aria-hidden
                >
                    <LineChart className={iconClass[size]} aria-hidden />
                </div>
                <div className="min-w-0">
                    <p
                        className={cn(
                            "font-heading font-semibold tracking-tight text-foreground",
                            titleClass[size],
                        )}
                    >
                        MedTrading
                    </p>
                    {subtitle ? (
                        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                    ) : null}
                </div>
            </div>
            <ThemeToggle variant={themeToggleVariant} className="shrink-0" />
        </div>
    )

    if (placement === "fixed") {
        return (
            <header
                className={cn(
                    "fixed inset-x-0 top-0 z-50 border-b border-border/60",
                    "bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
                    className,
                )}
            >
                {row}
            </header>
        )
    }

    if (placement === "sticky") {
        return (
            <header
                className={cn(
                    "sticky top-0 z-40 border-b border-border/60",
                    "bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
                    className,
                )}
            >
                {row}
            </header>
        )
    }

    return <header className={cn("w-full", className)}>{row}</header>
}
