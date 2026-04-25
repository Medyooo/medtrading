import { useState, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { tradeEndpoints } from "@/lib/tradeEndpoints"
import type { Trade } from "@/types"

export function useCloseTrade() {
    const token = useAppSelector((state) => state.auth.token)
    const [isLoading, setIsLoading] = useState(false)

    const closeTrade = useCallback(
        async (tradeId: number, exitPrice: number) => {
            if (!token) throw new Error("Non connecté")
            setIsLoading(true)
            try {
                return await apiClient.post<Trade>(tradeEndpoints.close(tradeId), { exitPrice }, token)
            } finally {
                setIsLoading(false)
            }
        },
        [token],
    )

    return { closeTrade, isLoading }
}
