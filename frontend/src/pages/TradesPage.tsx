import { useState, useMemo, useEffect } from "react"
import { Plus } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"
import { TradeTable } from "@/components/trades/TradeTable"
import { TradesPagination } from "@/components/trades/TradesPagination"
import { CreateTradeDialog } from "@/components/trades/CreateTradeDialog"
import { CloseTradeDialog } from "@/components/trades/CloseTradeDialog"
import { DeleteTradeDialog } from "@/components/trades/DeleteTradeDialog"
import { useTrades } from "@/hooks/useTrades"
import { usePairs } from "@/hooks/usePairs"
import { useCreateTrade } from "@/hooks/useCreateTrade"
import type { CreateTradePayload } from "@/hooks/useCreateTrade"
import { useCloseTrade } from "@/hooks/useCloseTrade"
import { useDeleteTrade } from "@/hooks/useDeleteTrade"
import type { Trade } from "@/types"

export default function TradesPage() {
    const token = useAppSelector((state) => state.auth.token)
    return <TradesWorkspace key={token ?? "__none__"} />
}

const DEFAULT_TRADE_PAGE_SIZE = 10

function TradesWorkspace() {
    const { trades, isLoading, error, refetch } = useTrades()
    const { pairs } = usePairs()
    const { createTrade, isLoading: isCreating } = useCreateTrade()
    const { closeTrade, isLoading: isClosing } = useCloseTrade()
    const { deleteTrade, isLoading: isDeleting } = useDeleteTrade()

    const [tradePage, setTradePage] = useState(1)
    const [tradePageSize, setTradePageSize] = useState(DEFAULT_TRADE_PAGE_SIZE)

    const tradeTotal = trades.length
    const tradeTotalPages = Math.max(1, Math.ceil(tradeTotal / tradePageSize))

    useEffect(() => {
        setTradePage((p) => Math.min(Math.max(1, p), tradeTotalPages))
    }, [tradeTotal, tradeTotalPages])

    const paginatedTrades = useMemo(() => {
        const p = Math.min(Math.max(1, tradePage), tradeTotalPages)
        const start = (p - 1) * tradePageSize
        return trades.slice(start, start + tradePageSize)
    }, [trades, tradePage, tradePageSize, tradeTotalPages])

    const [createOpen, setCreateOpen] = useState(false)
    const [closeOpen, setCloseOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
    const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null)

    const handleCreate = async (payload: CreateTradePayload) => {
        await createTrade(payload)
        await refetch()
    }

    const handleClose = async (exitPrice: number) => {
        if (!selectedTrade) return
        await closeTrade(selectedTrade.id, exitPrice)
        setSelectedTrade(null)
        await refetch()
    }

    const handleDeleteConfirm = async (id: number) => {
        await deleteTrade(id)
        setTradeToDelete(null)
        await refetch()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Trades</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Gérez vos positions.</p>
                </div>
                <Button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                >
                    <Plus className="mr-2 size-4" />
                    Nouveau trade
                </Button>
            </div>

            {error ? (
                <div
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                    {error}
                </div>
            ) : null}

            <TradeTable
                trades={paginatedTrades}
                isLoading={isLoading}
                isDeleting={isDeleting}
                onClose={(trade) => {
                    setSelectedTrade(trade)
                    setCloseOpen(true)
                }}
                onDelete={(trade) => {
                    setTradeToDelete(trade)
                    setDeleteOpen(true)
                }}
                footer={
                    !isLoading && tradeTotal > 0 ? (
                        <TradesPagination
                            page={tradePage}
                            pageSize={tradePageSize}
                            total={tradeTotal}
                            onPageChange={setTradePage}
                            onPageSizeChange={(size) => {
                                setTradePageSize(size)
                                setTradePage(1)
                            }}
                        />
                    ) : null
                }
            />

            <CreateTradeDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                pairs={pairs}
                isLoading={isCreating}
                onSubmit={handleCreate}
            />

            <CloseTradeDialog
                open={closeOpen}
                onOpenChange={(open) => {
                    setCloseOpen(open)
                    if (!open) setSelectedTrade(null)
                }}
                trade={selectedTrade}
                isLoading={isClosing}
                onSubmit={handleClose}
            />

            <DeleteTradeDialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open)
                    if (!open) setTradeToDelete(null)
                }}
                trade={tradeToDelete}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
