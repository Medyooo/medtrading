import { useId, useMemo, useState } from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DailyPnl } from "@/types"

function formatAxisDate(val: unknown): string {
    return parseDay(String(val)).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
    })
}

type RangeDays = 7 | 30 | 90

interface Props {
    data: DailyPnl[]
}

function parseDay(d: string): Date {
    const s = d.includes("T") ? d : `${d}T12:00:00`
    return new Date(s)
}

/** Fenêtre glissante : à partir du dernier jour présent dans les données (cohérent avec des seeds datés). */
function buildCumulativeSeries(daily: DailyPnl[], rangeDays: RangeDays) {
    if (!daily.length) return []

    const sorted = [...daily].sort(
        (a, b) => parseDay(a.date).getTime() - parseDay(b.date).getTime(),
    )

    const last = parseDay(sorted[sorted.length - 1].date)
    const start = new Date(last)
    start.setDate(start.getDate() - rangeDays)

    const filtered = sorted.filter((row) => {
        const t = parseDay(row.date).getTime()
        return t >= start.getTime() && t <= last.getTime()
    })

    const series = filtered.length ? filtered : sorted

    let cum = 0
    return series.map((row) => {
        cum += row.pnl
        return {
            date: row.date,
            cumulative: Number(cum.toFixed(2)),
        }
    })
}

export function PnlChart({ data }: Props) {
    const [range, setRange] = useState<RangeDays>(30)
    const gradientId = useId().replace(/:/g, "")

    const chartData = useMemo(() => buildCumulativeSeries(data, range), [data, range])

    const ranges: { key: RangeDays; label: string }[] = [
        { key: 7, label: "7j" },
        { key: 30, label: "30j" },
        { key: 90, label: "90j" },
    ]

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    P&amp;L cumulé
                </CardTitle>
                <div className="flex shrink-0 gap-1 rounded-lg bg-muted/60 p-1 dark:bg-muted/30">
                    {ranges.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setRange(key)}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                range === key
                                    ? "bg-emerald-100 text-emerald-900 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-100"
                                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {chartData.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
                        Aucune donnée sur cette période
                    </div>
                ) : (
                    <div className="h-[200px] w-full text-foreground">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 8, right: 8, left: 4, bottom: 24 }}
                            >
                                <defs>
                                    <linearGradient
                                        id={gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="rgb(16 185 129)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="rgb(16 185 129)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    type="category"
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                    minTickGap={24}
                                    tick={{
                                        fontSize: 12,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    tickFormatter={(v) => formatAxisDate(v)}
                                />
                                <YAxis hide domain={["auto", "auto"]} />
                                <Tooltip
                                    cursor={{
                                        stroke: "var(--muted-foreground)",
                                        strokeOpacity: 0.35,
                                    }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null
                                        const value = Number(payload[0].value)
                                        const dateLabel = parseDay(String(label)).toLocaleDateString(
                                            "fr-FR",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            },
                                        )
                                        return (
                                            <div
                                                className={cn(
                                                    "rounded-lg border border-border bg-popover px-3 py-2 shadow-md",
                                                    "text-popover-foreground",
                                                )}
                                            >
                                                <p className="text-sm font-medium leading-none text-foreground">
                                                    {dateLabel}
                                                </p>
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    P&amp;L cumulé
                                                </p>
                                                <p
                                                    className={cn(
                                                        "mt-0.5 text-sm font-semibold tabular-nums leading-snug tracking-tight",
                                                        value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                                                    )}
                                                >
                                                    {value >= 0 ? "+" : ""}
                                                    {value.toLocaleString("fr-FR")} $
                                                </p>
                                            </div>
                                        )
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cumulative"
                                    stroke="rgb(5 150 105)"
                                    strokeWidth={2}
                                    fill={`url(#${gradientId})`}
                                    fillOpacity={1}
                                    dot={(props) => {
                                        const { cx, cy, index } = props
                                        if (
                                            index === chartData.length - 1 &&
                                            cx != null &&
                                            cy != null
                                        ) {
                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={4}
                                                    fill="rgb(5 150 105)"
                                                    stroke="var(--card)"
                                                    strokeWidth={2}
                                                />
                                            )
                                        }
                                        return <g />
                                    }}
                                    activeDot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
