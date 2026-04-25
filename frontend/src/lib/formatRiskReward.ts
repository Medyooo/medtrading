export function formatRiskRewardRatioLabel(
    ratio: number | null | undefined,
): string | null {
    if (ratio == null || !Number.isFinite(ratio)) return null
    return `1:${ratio.toFixed(1)}`
}
