import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRiskRewardRatioLabel } from "@/lib/formatRiskReward"
import { formatTradeOpenedDate, formatTradeOpenedTime } from "@/lib/formatTradeOpenedAt"
import type { Trade } from "@/types"
import type { ReactNode } from "react"

function isLongDirection(d: Trade["direction"]): boolean {
    return d === "BUY" || d === "LONG"
}

interface Props {
    trades: Trade[]
    isLoading: boolean
    isDeleting?: boolean
    showActions?: boolean
    embedded?: boolean
    onClose?: (trade: Trade) => void
    onDelete?: (trade: Trade) => void
    footer?: ReactNode
    emptyTitle?: string
    emptySubtitle?: string
}

export function TradeTable({
    trades,
    isLoading,
    isDeleting = false,
    showActions = true,
    embedded = false,
    onClose,
    onDelete,
    footer,
    emptyTitle = "Aucun trade",
    emptySubtitle = "Créez un trade avec le bouton « Nouveau trade ».",
}: Props) {
    const actionsEnabled = showActions !== false
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (trades.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center py-16 text-muted-foreground",
                    !embedded && "rounded-lg border border-border",
                )}
            >
                <p className="text-lg font-medium">{emptyTitle}</p>
                <p className="text-sm">{emptySubtitle}</p>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex flex-col overflow-hidden",
                embedded ? "" : "rounded-lg border border-border",
            )}
        >
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Heure</TableHead>
                        <TableHead>Paire</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Entrée</TableHead>
                        <TableHead className="whitespace-nowrap" title="Stop loss">
                            SL
                        </TableHead>
                        <TableHead className="whitespace-nowrap" title="Take profit">
                            TP
                        </TableHead>
                        <TableHead>Sortie</TableHead>
                        <TableHead>Lot</TableHead>
                        <TableHead>R/R</TableHead>
                        <TableHead>P&amp;L</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Stratégie</TableHead>
                        <TableHead>TF</TableHead>
                        {actionsEnabled ? <TableHead className="text-right">Actions</TableHead> : null}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trades.map((trade) => {
                        const long = isLongDirection(trade.direction)
                        const closed = trade.status === "CLOSED"
                        return (
                            <TableRow key={trade.id}>
                                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                                    {formatTradeOpenedDate(trade.openedAt) ?? "—"}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                                    {formatTradeOpenedTime(trade.openedAt) ?? "—"}
                                </TableCell>
                                <TableCell className="font-medium">{trade.pairSymbol}</TableCell>
                                <TableCell>
                                    <Badge
                                        className={cn(
                                            long
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400",
                                        )}
                                    >
                                        {trade.direction}
                                    </Badge>
                                </TableCell>
                                <TableCell className="tabular-nums">{trade.entryPrice}</TableCell>
                                <TableCell className="tabular-nums text-muted-foreground">
                                    {trade.stopLoss != null ? trade.stopLoss : "—"}
                                </TableCell>
                                <TableCell className="tabular-nums text-muted-foreground">
                                    {trade.takeProfit != null ? trade.takeProfit : "—"}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {trade.exitPrice != null ? trade.exitPrice : "—"}
                                </TableCell>
                                <TableCell className="tabular-nums">{trade.lotSize}</TableCell>
                                <TableCell className="tabular-nums text-muted-foreground">
                                    {formatRiskRewardRatioLabel(trade.riskRewardRatio ?? null) ?? "—"}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {closed && trade.profitLoss != null ? (
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                trade.profitLoss >= 0 ? "text-emerald-500" : "text-red-500",
                                            )}
                                        >
                                            {trade.profitLoss >= 0 ? "+" : ""}
                                            {trade.profitLoss}$
                                        </span>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={trade.status === "OPEN" ? "default" : "secondary"}>
                                        {trade.status === "OPEN" ? "Ouvert" : "Fermé"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{trade.strategy ?? "—"}</TableCell>
                                <TableCell>{trade.timeframe ?? "—"}</TableCell>
                                {actionsEnabled ? (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {trade.status === "OPEN" && onClose ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onClose(trade)}
                                                >
                                                    <XCircle className="mr-1 size-4" />
                                                    Clôturer
                                                </Button>
                                            ) : null}
                                            {onDelete ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(trade)}
                                                    disabled={isDeleting}
                                                    className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                ) : null}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            </div>
            {footer}
        </div>
    )
}
