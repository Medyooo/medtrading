import {
    useState,
    useEffect,
    useMemo,
    type ComponentProps,
    type ComponentType,
    type ReactNode,
} from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Pair } from "@/types"
import type { CreateTradePayload } from "@/hooks/useCreateTrade"
import { computePlannedRiskRewardRatio, roundRiskRewardForApi } from "@/lib/computePlannedRiskReward"
import { formatRiskRewardRatioLabel } from "@/lib/formatRiskReward"
import { cn } from "@/lib/utils"
import {
    CandlestickChart,
    Crosshair,
    Layers,
    PiggyBank,
    Route,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react"

const TIMEFRAME_NONE = "__none__"

const TIMEFRAME_OPTIONS: { value: string; label: string; hint: string }[] = [
    { value: "M1", label: "M1", hint: "Scalping" },
    { value: "M5", label: "M5", hint: "Court terme" },
    { value: "M15", label: "M15", hint: "Intraday" },
    { value: "M30", label: "M30", hint: "Session" },
    { value: "H1", label: "H1", hint: "Classique" },
    { value: "H4", label: "H4", hint: "Swing léger" },
    { value: "D1", label: "D1", hint: "Daily" },
    { value: "W1", label: "W1", hint: "Position" },
]

const fieldShell =
    "bg-background border-border shadow-sm dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-none"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    pairs: Pair[]
    isLoading?: boolean
    onSubmit: (payload: CreateTradePayload) => Promise<void> | void
}

function SectionTitle({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
            <Icon className="size-3.5 shrink-0 text-foreground/55" aria-hidden />
            {children}
        </div>
    )
}

function FieldGroup({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("grid gap-2", className)} {...props} />
}

export function CreateTradeDialog({ open, onOpenChange, pairs, isLoading = false, onSubmit }: Props) {
    const [pairId, setPairId] = useState<string>("")
    const [direction, setDirection] = useState<string>("LONG")
    const [entryPrice, setEntryPrice] = useState("")
    const [stopLoss, setStopLoss] = useState("")
    const [takeProfit, setTakeProfit] = useState("")
    const [lotSize, setLotSize] = useState("0.1")
    const [strategy, setStrategy] = useState("")
    const [timeframe, setTimeframe] = useState<string>("H1")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (open && pairs.length > 0 && !pairId) {
            setPairId(String(pairs[0].id))
        }
    }, [open, pairs, pairId])

    const plannedRiskReward = useMemo(() => {
        const entry = Number(entryPrice.replace(",", "."))
        if (!Number.isFinite(entry) || entry <= 0) return null
        const slRaw = stopLoss.trim() ? Number(stopLoss.replace(",", ".")) : null
        const tpRaw = takeProfit.trim() ? Number(takeProfit.replace(",", ".")) : null
        return computePlannedRiskRewardRatio({
            direction,
            entryPrice: entry,
            stopLoss: slRaw,
            takeProfit: tpRaw,
        })
    }, [direction, entryPrice, stopLoss, takeProfit])

    const reset = () => {
        setPairId(pairs[0] ? String(pairs[0].id) : "")
        setDirection("LONG")
        setEntryPrice("")
        setStopLoss("")
        setTakeProfit("")
        setLotSize("0.1")
        setStrategy("")
        setTimeframe("H1")
        setNotes("")
    }

    const handleSubmit = async () => {
        const pid = Number(pairId)
        const entry = Number(entryPrice.replace(",", "."))
        const lot = Number(lotSize.replace(",", "."))
        if (!Number.isFinite(pid) || !Number.isFinite(entry) || entry <= 0) return
        if (!Number.isFinite(lot) || lot <= 0) return
        const sl = stopLoss.trim() ? Number(stopLoss.replace(",", ".")) : null
        const tp = takeProfit.trim() ? Number(takeProfit.replace(",", ".")) : null
        const tf = timeframe === TIMEFRAME_NONE ? null : timeframe
        const payload: CreateTradePayload = {
            pairId: pid,
            direction,
            entryPrice: entry,
            lotSize: lot,
            strategy: strategy.trim() || null,
            timeframe: tf,
            notes: notes.trim() || null,
        }
        if (sl != null && Number.isFinite(sl)) payload.stopLoss = sl
        if (tp != null && Number.isFinite(tp)) payload.takeProfit = tp
        if (plannedRiskReward != null) payload.riskRewardRatio = roundRiskRewardForApi(plannedRiskReward)
        try {
            await onSubmit(payload)
            reset()
            onOpenChange(false)
        } catch {
            /* erreur API : garder le dialogue ouvert */
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v)
                if (!v) reset()
            }}
        >
            <DialogContent
                className={cn(
                    "flex max-h-[min(90vh,760px)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
                    "border-2 border-border bg-card text-card-foreground shadow-2xl ring-0",
                )}
            >
                <DialogHeader className="shrink-0 space-y-0 border-b border-border bg-secondary px-5 py-4 text-left">
                    <div className="flex items-start gap-3.5 pr-8">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-600/20 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300"
                            aria-hidden
                        >
                            <CandlestickChart className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Nouveau trade
                            </DialogTitle>
                            <DialogDescription className="text-pretty text-sm leading-relaxed text-foreground/75">
                                Paire, niveaux et contexte. Le R/R se calcule dès que le stop et le take profit sont renseignés.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div
                    className={cn(
                        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
                        "[&_[data-slot=input]]:h-9 [&_[data-slot=input]]:md:text-sm",
                        "[&_[data-slot=textarea]]:min-h-[5rem] [&_[data-slot=textarea]]:md:text-sm",
                        "[&_[data-slot=input]]:bg-background [&_[data-slot=textarea]]:bg-background [&_[data-slot=select-trigger]]:bg-background",
                        "[&_[data-slot=input]]:border-border [&_[data-slot=textarea]]:border-border [&_[data-slot=select-trigger]]:border-border",
                        "[&_[data-slot=input]]:shadow-sm [&_[data-slot=textarea]]:shadow-sm [&_[data-slot=select-trigger]]:shadow-sm",
                        "dark:[&_[data-slot=input]]:bg-zinc-950 dark:[&_[data-slot=textarea]]:bg-zinc-950 dark:[&_[data-slot=select-trigger]]:bg-zinc-950",
                        "dark:[&_[data-slot=input]]:border-zinc-800 dark:[&_[data-slot=textarea]]:border-zinc-800 dark:[&_[data-slot=select-trigger]]:border-zinc-800",
                    )}
                >
                    <div className="grid gap-4">
                        <section
                            className="rounded-xl border border-border bg-muted p-4 shadow-sm dark:bg-zinc-900 dark:shadow-none"
                            aria-labelledby="ct-sec-instrument"
                        >
                            <div id="ct-sec-instrument" className="sr-only">
                                Instrument et direction
                            </div>
                            <div className="mb-3">
                                <SectionTitle icon={Layers}>Instrument & sens</SectionTitle>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <FieldGroup>
                                    <Label htmlFor="ct-pair" className="text-foreground/90">
                                        Paire
                                    </Label>
                                    <Select value={pairId} onValueChange={setPairId} disabled={isLoading || pairs.length === 0}>
                                        <SelectTrigger id="ct-pair" className={cn("h-9 w-full", fieldShell)}>
                                            <SelectValue placeholder="Choisir une paire" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pairs.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    <span className="font-medium">{p.symbol}</span>
                                                    <span className="text-muted-foreground"> — {p.name}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup>
                                    <Label htmlFor="ct-direction" className="text-foreground/90">
                                        Direction
                                    </Label>
                                    <Select value={direction} onValueChange={setDirection} disabled={isLoading}>
                                        <SelectTrigger id="ct-direction" className={cn("h-9 w-full", fieldShell)}>
                                            <SelectValue placeholder="Long ou short" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LONG">
                                                <span className="flex items-center gap-2">
                                                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                                                    <span>Long</span>
                                                    <span className="text-xs text-muted-foreground">achat</span>
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="SHORT">
                                                <span className="flex items-center gap-2">
                                                    <TrendingDown className="size-4 text-red-600 dark:text-red-400" aria-hidden />
                                                    <span>Short</span>
                                                    <span className="text-xs text-muted-foreground">vente</span>
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                            </div>
                        </section>

                        <section
                            className="rounded-xl border border-border bg-muted p-4 shadow-sm dark:bg-zinc-900 dark:shadow-none"
                            aria-labelledby="ct-sec-levels"
                        >
                            <div id="ct-sec-levels" className="sr-only">
                                Niveaux et ratio R/R
                            </div>
                            <div className="mb-3">
                                <SectionTitle icon={Crosshair}>Niveaux & objectif</SectionTitle>
                            </div>
                            <div className="grid gap-3">
                                <FieldGroup>
                                    <Label htmlFor="ct-entry" className="text-foreground/90">
                                        Prix d&apos;entrée <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="ct-entry"
                                        value={entryPrice}
                                        onChange={(e) => setEntryPrice(e.target.value)}
                                        disabled={isLoading}
                                        inputMode="decimal"
                                        placeholder="2650.50"
                                        className="tabular-nums"
                                    />
                                </FieldGroup>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                    <FieldGroup>
                                        <Label htmlFor="ct-sl" className="text-foreground/90">
                                            Stop loss
                                        </Label>
                                        <Input
                                            id="ct-sl"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(e.target.value)}
                                            disabled={isLoading}
                                            inputMode="decimal"
                                            placeholder="2640"
                                            className="tabular-nums"
                                        />
                                    </FieldGroup>
                                    <FieldGroup>
                                        <Label htmlFor="ct-tp" className="text-foreground/90">
                                            Take profit
                                        </Label>
                                        <Input
                                            id="ct-tp"
                                            value={takeProfit}
                                            onChange={(e) => setTakeProfit(e.target.value)}
                                            disabled={isLoading}
                                            inputMode="decimal"
                                            placeholder="2680"
                                            className="tabular-nums"
                                        />
                                    </FieldGroup>
                                </div>
                                <div
                                    className={cn(
                                        "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-3 sm:px-4",
                                        plannedRiskReward != null
                                            ? "border-emerald-600/35 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950 dark:text-emerald-50"
                                            : "border-dashed border-border bg-background text-muted-foreground dark:bg-zinc-950",
                                    )}
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <Target
                                            className={cn(
                                                "size-4 shrink-0",
                                                plannedRiskReward != null
                                                    ? "text-emerald-700 dark:text-emerald-300"
                                                    : "text-muted-foreground",
                                            )}
                                            aria-hidden
                                        />
                                        R/R prévu
                                    </span>
                                    <span className="text-base font-semibold tabular-nums tracking-tight">
                                        {formatRiskRewardRatioLabel(plannedRiskReward) ?? "—"}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section
                            className="rounded-xl border border-border bg-muted p-4 shadow-sm dark:bg-zinc-900 dark:shadow-none"
                            aria-labelledby="ct-sec-context"
                        >
                            <div id="ct-sec-context" className="sr-only">
                                Taille, stratégie et notes
                            </div>
                            <div className="mb-3">
                                <SectionTitle icon={PiggyBank}>Taille & contexte</SectionTitle>
                            </div>
                            <div className="grid gap-3">
                                <FieldGroup>
                                    <Label htmlFor="ct-lot" className="text-foreground/90">
                                        Taille du lot <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="ct-lot"
                                        value={lotSize}
                                        onChange={(e) => setLotSize(e.target.value)}
                                        disabled={isLoading}
                                        inputMode="decimal"
                                        placeholder="0.1"
                                        className="max-w-[12rem] tabular-nums"
                                    />
                                </FieldGroup>
                                <FieldGroup>
                                    <Label htmlFor="ct-strat" className="text-foreground/90">
                                        Stratégie
                                    </Label>
                                    <Input
                                        id="ct-strat"
                                        value={strategy}
                                        onChange={(e) => setStrategy(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Cassure, retest, structure…"
                                    />
                                </FieldGroup>
                                <FieldGroup>
                                    <Label htmlFor="ct-tf" className="text-foreground/90">
                                        Timeframe
                                    </Label>
                                    <Select value={timeframe} onValueChange={setTimeframe} disabled={isLoading}>
                                        <SelectTrigger id="ct-tf" className={cn("h-9 w-full", fieldShell)}>
                                            <SelectValue placeholder="Graphique de décision" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={TIMEFRAME_NONE}>
                                                <span className="text-muted-foreground">Non précisé</span>
                                            </SelectItem>
                                            {TIMEFRAME_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <span className="flex w-full min-w-[12rem] items-center justify-between gap-4">
                                                        <span className="font-medium tabular-nums">{opt.label}</span>
                                                        <span className="text-xs text-muted-foreground">{opt.hint}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldGroup>
                                <FieldGroup>
                                    <Label htmlFor="ct-notes" className="text-foreground/90">
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="ct-notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        disabled={isLoading}
                                        rows={3}
                                        placeholder="Sortie, actualités, remarques…"
                                        className="resize-y"
                                    />
                                </FieldGroup>
                            </div>
                        </section>
                    </div>
                </div>

                <DialogFooter
                    className={cn(
                        "!mx-0 !mb-0 shrink-0 gap-3 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-900",
                    )}
                >
                    <p className="flex items-center gap-2 text-xs text-foreground/70">
                        <Sparkles className="size-3.5 shrink-0 text-foreground/50" aria-hidden />
                        <span>
                            Champs <span className="text-destructive">*</span> obligatoires — le reste est optionnel.
                        </span>
                    </p>
                    <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            className="min-w-[10.5rem] bg-emerald-600 text-white shadow-md hover:bg-emerald-500"
                            onClick={() => void handleSubmit()}
                            disabled={isLoading || pairs.length === 0}
                        >
                            <Route className="mr-2 size-4 shrink-0 opacity-95" aria-hidden />
                            {isLoading ? "Création…" : "Créer le trade"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
