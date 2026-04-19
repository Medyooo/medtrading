import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

interface Props {
    trades: Trade[]
}

export function RecentTrades({ trades }: Props) {
    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Trades récents
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {trades.length === 0 && (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                            Aucun trade pour le moment
                        </p>
                    )}
                    {trades.map((trade) => {
                        const isLong =
                            trade.direction === "BUY" || trade.direction === "LONG"
                        return (
                        <div
                            key={trade.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span
                                    className={cn(
                                        "shrink-0 rounded px-2 py-1 text-xs font-medium",
                                        isLong
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-red-500/10 text-red-500",
                                    )}
                                >
                                    {trade.direction}
                                </span>
                                <span className="truncate text-sm font-medium text-foreground">
                                    {trade.pairSymbol}
                                </span>
                                {trade.timeframe ? (
                                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                                        {trade.timeframe}
                                    </span>
                                ) : null}
                            </div>
                            <div className="shrink-0 pl-2 text-right">
                                {trade.profitLoss !== undefined && trade.profitLoss !== null ? (
                                    <span
                                        className={cn(
                                            "text-2xl font-bold tabular-nums",
                                            trade.profitLoss >= 0 ? "text-emerald-500" : "text-red-500",
                                        )}
                                    >
                                        {trade.profitLoss >= 0 ? "+" : ""}
                                        {trade.profitLoss}$
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Ouvert
                                    </span>
                                )}
                            </div>
                        </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
