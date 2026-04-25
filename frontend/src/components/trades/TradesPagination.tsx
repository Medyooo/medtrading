import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export interface TradesPaginationProps {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    disabled?: boolean
}

export function TradesPagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    disabled = false,
}: TradesPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
    const to = Math.min(safePage * pageSize, total)

    return (
        <nav
            className={cn(
                "flex flex-col gap-3 border-t border-border bg-muted px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-3 dark:bg-zinc-900",
                disabled && "pointer-events-none opacity-50",
            )}
            aria-label="Pagination des trades"
        >
            <p className="text-center text-sm text-muted-foreground sm:text-left">
                {total === 0 ? (
                    "Aucun trade à afficher"
                ) : (
                    <>
                        <span className="tabular-nums font-medium text-foreground">
                            {from}–{to}
                        </span>
                        <span> sur </span>
                        <span className="tabular-nums font-medium text-foreground">{total}</span>
                    </>
                )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <div className="flex items-center gap-2">
                    <span className="sr-only" id="trades-page-size-label">
                        Trades par page
                    </span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                        disabled={disabled || total === 0}
                    >
                        <SelectTrigger
                            size="sm"
                            className="h-8 w-[4.5rem] bg-background"
                            aria-labelledby="trades-page-size-label"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="size-8"
                        aria-label="Page précédente"
                        disabled={disabled || safePage <= 1}
                        onClick={() => onPageChange(safePage - 1)}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-muted-foreground">
                        Page{" "}
                        <span className="font-medium text-foreground">
                            {total === 0 ? 0 : safePage}
                        </span>{" "}
                        / {total === 0 ? 0 : totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="size-8"
                        aria-label="Page suivante"
                        disabled={disabled || safePage >= totalPages || total === 0}
                        onClick={() => onPageChange(safePage + 1)}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}
