import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Trade } from "@/types"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    trade: Trade | null
    isLoading?: boolean
    onSubmit: (exitPrice: number) => Promise<void> | void
}

export function CloseTradeDialog({ open, onOpenChange, trade, isLoading = false, onSubmit }: Props) {
    const [exitPrice, setExitPrice] = useState("")

    useEffect(() => {
        if (open && trade) {
            setExitPrice(trade.entryPrice != null ? String(trade.entryPrice) : "")
        }
    }, [open, trade])

    const handleSubmit = async () => {
        const n = Number(exitPrice.replace(",", "."))
        if (!Number.isFinite(n) || n <= 0) return
        try {
            await onSubmit(n)
            onOpenChange(false)
        } catch {
            /* erreur API */
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clôturer le trade</DialogTitle>
                    <DialogDescription>
                        {trade
                            ? `${trade.pairSymbol} — prix de sortie pour calculer le P&L.`
                            : "Sélectionnez un trade."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="exit-price">Prix de sortie</Label>
                    <Input
                        id="exit-price"
                        type="text"
                        inputMode="decimal"
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button type="button" onClick={() => void handleSubmit()} disabled={isLoading || !trade}>
                        {isLoading ? "En cours…" : "Clôturer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
