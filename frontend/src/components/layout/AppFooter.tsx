import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type AppFooterProps = {
    className?: string
    children?: ReactNode
}

export function AppFooter({ className, children }: AppFooterProps) {
    const year = new Date().getFullYear()

    return (
        <footer
            className={cn(
                "relative z-10 border-t border-border/60",
                "bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
                className,
            )}
        >
            <div
                className={cn(
                    "mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 sm:py-6",
                    "lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10 lg:py-5 xl:px-16",
                )}
            >
                <p className="shrink-0 text-xs text-muted-foreground">
                    © {year} MedTrading
                </p>
                {children ? (
                    <div className="text-center text-xs leading-relaxed text-muted-foreground lg:text-right">
                        {children}
                    </div>
                ) : null}
            </div>
        </footer>
    )
}
