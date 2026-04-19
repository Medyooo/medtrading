import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TopPair } from "@/types"

interface Props {
    data: TopPair[]
}

function formatPnl(value: number): string {
    const abs = Math.abs(value)
    const formatted = abs.toLocaleString("en-US", { maximumFractionDigits: 0 })
    if (value > 0) return `+$${formatted}`
    if (value < 0) return `-$${formatted}`
    return "$0"
}

export function TopPairsChart({ data }: Props) {
    const rows = useMemo(() => {
        const sorted = [...data].sort(
            (a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl),
        )
        return sorted.slice(0, 8)
    }, [data])

    const maxAbs = useMemo(() => {
        if (!rows.length) return 0
        return Math.max(...rows.map((r) => Math.abs(r.totalPnl)), 1e-9)
    }, [rows])

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top paires
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {rows.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                        Aucune paire pour le moment
                    </p>
                ) : (
                    <ul className="space-y-2.5">
                        {rows.map((row) => {
                            const positive = row.totalPnl >= 0
                            const pct = Math.min(
                                100,
                                (Math.abs(row.totalPnl) / maxAbs) * 100,
                            )
                            return (
                                <li key={row.symbol}>
                                    <div className="mb-0.5 flex items-baseline justify-between gap-3">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {row.symbol}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-sm font-semibold tabular-nums",
                                                positive
                                                    ? "text-emerald-500"
                                                    : "text-red-500",
                                            )}
                                        >
                                            {formatPnl(row.totalPnl)}
                                        </span>
                                    </div>
                                    <div
                                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                                        role="presentation"
                                        aria-hidden
                                    >
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-[width] duration-500 ease-out",
                                                positive ? "bg-emerald-500" : "bg-red-500",
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
