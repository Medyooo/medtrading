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
    const d = typeof val === "number" ? new Date(val) : parseDay(String(val))
    if (!Number.isFinite(d.getTime())) return ""
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
    })
}

function toYyyyMmDd(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

type RangeDays = 7 | 30 | 365

interface Props {
    data: DailyPnl[]
}

function coerceDayString(raw: unknown): string {
    if (typeof raw === "string" && raw.trim()) return raw.trim()
    if (Array.isArray(raw) && raw.length >= 3) {
        const y = Number(raw[0])
        const m = Number(raw[1])
        const d = Number(raw[2])
        if (![y, m, d].every((n) => Number.isFinite(n))) return ""
        return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    }
    return ""
}

function parseDay(d: string): Date {
    if (!d) return new Date(NaN)
    const s = d.includes("T") ? d : `${d}T12:00:00`
    return new Date(s)
}

function coercePnl(raw: unknown): number {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw
    if (typeof raw === "string") {
        const n = Number(raw.replace(",", "."))
        return Number.isFinite(n) ? n : 0
    }
    return 0
}

type DailyPoint = {
    date: string
    t: number
    pnl: number
}

type PnlChartPoint = {
    t: number
    date: string
    cumulative: number
    /** Point artificiel (0 $) au début de la fenêtre — masqué des libellés de période. */
    isPeriodStart?: boolean
}

function normalizeDailyRows(daily: DailyPnl[]): DailyPoint[] {
    if (!daily.length) return []
    const rows = daily
        .map((row) => {
            const date = coerceDayString(row.date)
            const day = parseDay(date)
            if (!date || !Number.isFinite(day.getTime())) return null
            return {
                date,
                t: day.getTime(),
                pnl: coercePnl(row.pnl),
            }
        })
        .filter((r): r is DailyPoint => r != null)
    return [...rows].sort((a, b) => a.t - b.t)
}

/**
 * Courbe sur la fenêtre : point de départ explicite à **0 $**, puis cumul des P&amp;L journaliers
 * uniquement sur la période (plus de soustraction sur le cumul global — évite les décalages type « toujours 850 »).
 */
function buildChartSeries(points: DailyPoint[], rangeDays: RangeDays): PnlChartPoint[] {
    if (!points.length) return []

    const lastMs = points[points.length - 1].t
    const lastDate = new Date(lastMs)
    if (!Number.isFinite(lastDate.getTime())) return []

    const windowLeft = new Date(lastDate)
    windowLeft.setDate(windowLeft.getDate() - rangeDays)

    let windowed = points.filter((p) => p.t >= windowLeft.getTime() && p.t <= lastMs)
    if (!windowed.length) windowed = points

    const firstTrade = windowed[0]
    let anchor = new Date(windowLeft)
    anchor.setHours(0, 0, 0, 0)
    let anchorT = anchor.getTime()
    if (anchorT >= firstTrade.t) {
        anchor = new Date(firstTrade.t)
        anchor.setDate(anchor.getDate() - 1)
        anchor.setHours(0, 0, 0, 0)
        anchorT = anchor.getTime()
    }

    const out: PnlChartPoint[] = [
        {
            t: anchorT,
            date: toYyyyMmDd(anchor),
            cumulative: 0,
            isPeriodStart: true,
        },
    ]

    let running = 0
    for (const p of windowed) {
        running += p.pnl
        out.push({
            t: p.t,
            date: p.date,
            cumulative: Number(running.toFixed(2)),
        })
    }

    return out
}

function yDomainWithPadding(vals: number[]): [number, number] {
    if (!vals.length) return [0, 1]
    let lo = Math.min(0, ...vals)
    let hi = Math.max(0, ...vals)
    const pad = Math.max(Math.abs(hi - lo) * 0.06, 1)
    lo -= pad
    hi += pad
    if (lo === hi) {
        lo -= 1
        hi += 1
    }
    return [lo, hi]
}

export function PnlChart({ data }: Props) {
    const [range, setRange] = useState<RangeDays>(30)
    const gradientId = useId().replace(/:/g, "")

    const dailyPoints = useMemo(() => normalizeDailyRows(data), [data])
    const chartData = useMemo(() => buildChartSeries(dailyPoints, range), [dailyPoints, range])

    const tradePoints = useMemo(() => chartData.filter((p) => !p.isPeriodStart), [chartData])

    const periodSummary = useMemo(() => {
        if (tradePoints.length === 0) return null
        const first = new Date(tradePoints[0].t)
        const last = new Date(tradePoints[tradePoints.length - 1].t)
        if (!Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime())) return null
        const fmt: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
        const delta = tradePoints[tradePoints.length - 1].cumulative
        return {
            range: `${first.toLocaleDateString("fr-FR", fmt)} → ${last.toLocaleDateString("fr-FR", fmt)}`,
            delta,
        }
    }, [tradePoints])

    const yDomain = useMemo(() => yDomainWithPadding(chartData.map((d) => d.cumulative)), [chartData])

    const ranges: { key: RangeDays; label: string }[] = [
        { key: 7, label: "7 j." },
        { key: 30, label: "30 j." },
        { key: 365, label: "1 an" },
    ]

    const lastIdx = Math.max(0, chartData.length - 1)

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        P&amp;L cumulé (sur la période)
                    </CardTitle>
                    {periodSummary ? (
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                            <p className="tabular-nums">{periodSummary.range}</p>
                            <p
                                className={cn(
                                    "font-medium tabular-nums",
                                    periodSummary.delta >= 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-red-600 dark:text-red-400",
                                )}
                            >
                                Variation sur la période : {periodSummary.delta >= 0 ? "+" : ""}
                                {periodSummary.delta.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} $
                            </p>
                        </div>
                    ) : null}
                </div>
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
                {chartData.length <= 1 ? (
                    <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
                        Aucune donnée (trades fermés avec P&amp;L)
                    </div>
                ) : (
                    <div className="h-[220px] w-full text-foreground">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 28 }}
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
                                            stopOpacity={0.28}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="rgb(16 185 129)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="t"
                                    type="number"
                                    domain={["dataMin", "dataMax"]}
                                    scale="time"
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                    minTickGap={32}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    tickFormatter={(v) => formatAxisDate(v)}
                                />
                                <YAxis
                                    hide
                                    width={0}
                                    domain={yDomain}
                                    tickCount={5}
                                />
                                <Tooltip
                                    cursor={{
                                        stroke: "var(--muted-foreground)",
                                        strokeOpacity: 0.25,
                                    }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        const row = payload[0].payload as PnlChartPoint
                                        if (row.isPeriodStart) {
                                            return (
                                                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                                                    <p className="font-medium text-foreground">Début de période</p>
                                                    <p className="mt-1 text-muted-foreground">P&amp;L cumulé : 0 $</p>
                                                </div>
                                            )
                                        }
                                        const value = Number(row.cumulative)
                                        const dateLabel = parseDay(row.date).toLocaleDateString("fr-FR", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        return (
                                            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                                                <p className="text-sm font-medium leading-none text-foreground">
                                                    {dateLabel}
                                                </p>
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    P&amp;L cumulé (période)
                                                </p>
                                                <p
                                                    className={cn(
                                                        "mt-0.5 text-sm font-semibold tabular-nums",
                                                        value >= 0
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-red-600 dark:text-red-400",
                                                    )}
                                                >
                                                    {value >= 0 ? "+" : ""}
                                                    {value.toLocaleString("fr-FR", {
                                                        maximumFractionDigits: 2,
                                                    })}{" "}
                                                    $
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
                                    baseValue={0}
                                    isAnimationActive={false}
                                    dot={(props) => {
                                        const { cx, cy, index } = props
                                        if (index === lastIdx && cx != null && cy != null) {
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
