import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

interface Props {
    trades: Trade[]
    limit?: number
}

function isLongDirection(d: Trade["direction"]): boolean {
    return d === "BUY" || d === "LONG"
}

function formatPrice(pair: string, price: number): string {
    if (pair.includes("JPY")) {
        return price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    if (pair.includes("XAU") || pair.includes("BTC")) {
        return price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return price.toLocaleString("fr-FR", { minimumFractionDigits: 5, maximumFractionDigits: 5 })
}

function riskRewardLabel(t: Trade): string | null {
    if (t.status !== "CLOSED") return null
    if (t.stopLoss == null || t.takeProfit == null) return null
    const e = t.entryPrice
    const sl = t.stopLoss
    const tp = t.takeProfit
    const long = isLongDirection(t.direction)
    const reward = long ? tp - e : e - tp
    const risk = long ? e - sl : sl - e
    if (risk <= 0 || reward <= 0) return null
    return `1:${(reward / risk).toFixed(1)}`
}

export function LatestTradesTable({ trades, limit = 6 }: Props) {
    const rows = trades.slice(0, limit)

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Derniers trades
                </CardTitle>
                <Link
                    to="/trades"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                    Voir tout
                </Link>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="-mx-1 overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-left dark:bg-muted/30">
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    Paire
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    Direction
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    Entrée
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    Sortie
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    P&amp;L
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    R/R
                                </th>
                                <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">
                                    Statut
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-3 py-8 text-center text-xs text-muted-foreground"
                                    >
                                        Aucun trade pour le moment
                                    </td>
                                </tr>
                            ) : (
                                rows.map((trade) => {
                                    const long = isLongDirection(trade.direction)
                                    const rr = riskRewardLabel(trade)
                                    const closed = trade.status === "CLOSED"
                                    return (
                                        <tr
                                            key={trade.id}
                                            className="border-b border-border last:border-0"
                                        >
                                            <td className="px-3 py-2.5 font-semibold text-foreground">
                                                {trade.pairSymbol}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span
                                                    className={cn(
                                                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                                                        long
                                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-red-500/15 text-red-700 dark:text-red-400",
                                                    )}
                                                >
                                                    {trade.direction}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums text-foreground">
                                                {formatPrice(trade.pairSymbol, trade.entryPrice)}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums text-foreground">
                                                {closed && trade.exitPrice != null
                                                    ? formatPrice(trade.pairSymbol, trade.exitPrice)
                                                    : "—"}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums">
                                                {closed &&
                                                trade.profitLoss !== undefined &&
                                                trade.profitLoss !== null ? (
                                                    <span
                                                        className={cn(
                                                            "font-semibold",
                                                            trade.profitLoss >= 0
                                                                ? "text-emerald-500"
                                                                : "text-red-500",
                                                        )}
                                                    >
                                                        {trade.profitLoss >= 0 ? "+" : ""}
                                                        {trade.profitLoss.toLocaleString("fr-FR", {
                                                            maximumFractionDigits: 0,
                                                        })}
                                                        $
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                                                {rr ?? "—"}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span
                                                    className={cn(
                                                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                                                        closed
                                                            ? "bg-muted text-foreground dark:bg-muted/60"
                                                            : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
                                                    )}
                                                >
                                                    {closed ? "Fermé" : "Ouvert"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
