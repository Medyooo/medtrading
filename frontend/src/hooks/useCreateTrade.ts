import { useState, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { tradeEndpoints } from "@/lib/tradeEndpoints"
import type { Trade } from "@/types"

export interface CreateTradePayload {
    pairId: number
    direction: string
    entryPrice: number
    stopLoss?: number | null
    takeProfit?: number | null
    lotSize: number
    strategy?: string | null
    timeframe?: string | null
    notes?: string | null
    riskRewardRatio?: number | null
}

export function useCreateTrade() {
    const token = useAppSelector((state) => state.auth.token)
    const [isLoading, setIsLoading] = useState(false)

    const createTrade = useCallback(
        async (payload: CreateTradePayload) => {
            if (!token) throw new Error("Non connecté")
            setIsLoading(true)
            try {
                const body: Record<string, unknown> = {
                    pairId: payload.pairId,
                    direction: payload.direction,
                    entryPrice: payload.entryPrice,
                    lotSize: payload.lotSize,
                }
                if (payload.stopLoss != null) body.stopLoss = payload.stopLoss
                if (payload.takeProfit != null) body.takeProfit = payload.takeProfit
                if (payload.strategy) body.strategy = payload.strategy
                if (payload.timeframe) body.timeframe = payload.timeframe
                if (payload.notes) body.notes = payload.notes
                if (payload.riskRewardRatio != null) body.riskRewardRatio = payload.riskRewardRatio
                return await apiClient.post<Trade>(tradeEndpoints.create, body, token)
            } finally {
                setIsLoading(false)
            }
        },
        [token],
    )

    return { createTrade, isLoading }
}
