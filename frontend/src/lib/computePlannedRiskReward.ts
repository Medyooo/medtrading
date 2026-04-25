type Direction = string

function num(v: number | "" | null | undefined): number | null {
    if (v === "" || v == null) return null
    const n = typeof v === "number" ? v : Number(v)
    return Number.isFinite(n) ? n : null
}

function rrLong(entry: number, sl: number, tp: number): number | null {
    const risk = entry - sl
    const reward = tp - entry
    if (risk <= 0 || reward <= 0) return null
    return reward / risk
}

function rrShort(entry: number, sl: number, tp: number): number | null {
    const risk = sl - entry
    const reward = entry - tp
    if (risk <= 0 || reward <= 0) return null
    return reward / risk
}

/**
 * R/R prévu (récompense / risque) à partir des prix du plan, même logique que le backend
 * (priorité à la direction, sinon l’autre géométrie si valide).
 */
export function computePlannedRiskRewardRatio(params: {
    direction: Direction
    entryPrice: number
    stopLoss?: number | "" | null
    takeProfit?: number | "" | null
}): number | null {
    const entry = num(params.entryPrice)
    const sl = num(params.stopLoss)
    const tp = num(params.takeProfit)
    if (entry == null || sl == null || tp == null) return null

    const d = (params.direction || "").toUpperCase()
    const preferShort = d === "SHORT" || d === "SELL"
    const shortR = rrShort(entry, sl, tp)
    const longR = rrLong(entry, sl, tp)
    if (preferShort) return shortR ?? longR
    return longR ?? shortR
}

/** Arrondi pour l’envoi JSON (aligné sur le NUMERIC(12,4) du backend). */
export function roundRiskRewardForApi(ratio: number): number {
    return Math.round(ratio * 10_000) / 10_000
}
