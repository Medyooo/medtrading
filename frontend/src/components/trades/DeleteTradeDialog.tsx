import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Trade } from "@/types"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    trade: Trade | null
    isLoading?: boolean
    onConfirm: (tradeId: number) => Promise<void> | void
}

export function DeleteTradeDialog({ open, onOpenChange, trade, isLoading = false, onConfirm }: Props) {
    const title = trade ? `Supprimer le trade ${trade.pairSymbol}` : "Supprimer le trade"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Cette action est définitive. Le trade sera supprimé et ne pourra pas être récupéré.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            if (!trade) return
                            try {
                                await onConfirm(trade.id)
                                onOpenChange(false)
                            } catch {
                                /* erreur API */
                            }
                        }}
                        disabled={isLoading || !trade}
                    >
                        {isLoading ? "Suppression..." : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

