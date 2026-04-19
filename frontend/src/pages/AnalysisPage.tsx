import { useTheme } from "@/components/theme-provider"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { useEffect, useRef } from "react"

const DEFAULT_SYMBOL = "OANDA:XAUUSD"
const DEFAULT_INTERVAL = "60"

export default function AnalysisPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        el.innerHTML = ""

        const widget = document.createElement("div")
        widget.className = "tradingview-widget-container__widget h-full w-full min-h-[320px]"
        el.appendChild(widget)

        const script = document.createElement("script")
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
        script.async = true
        script.type = "text/javascript"
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: DEFAULT_SYMBOL,
            interval: DEFAULT_INTERVAL,
            timezone: "Europe/Paris",
            theme: theme === "dark" ? "dark" : "light",
            style: "1",
            locale: "fr",
            allow_symbol_change: true,
            calendar: false,
            hide_side_toolbar: false,
            hide_top_toolbar: false,
            support_host: "https://www.tradingview.com",
            width: "100%",
            height: "100%",
        })

        el.appendChild(script)

        return () => {
            el.innerHTML = ""
        }
    }, [theme])

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Analyse</h1>
                <a
                    href="https://www.tradingview.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium",
                        "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
                    )}
                >
                    TradingView
                    <ExternalLink className="size-3.5 shrink-0 opacity-80" aria-hidden />
                </a>
            </div>

            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 py-0 shadow-sm gap-0">
                <CardContent className="relative flex min-h-0 flex-1 flex-col p-0">
                    <div
                        className={cn(
                            "tradingview-widget-container min-h-0 w-full flex-1",
                            "bg-muted/15 dark:bg-muted/25",
                        )}
                        ref={containerRef}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
