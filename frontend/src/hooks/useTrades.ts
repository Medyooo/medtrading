import { useCallback, useEffect, useState } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { tradeEndpoints } from "@/lib/tradeEndpoints"
import type { Trade } from "@/types"

export function useTrades() {
    const token = useAppSelector((state) => state.auth.token)
    const [trades, setTrades] = useState<Trade[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(token))
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        if (!token) {
            setTrades([])
            setIsLoading(false)
            setError(null)
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const data = await apiClient.get<Trade[]>(tradeEndpoints.myTrades, token)
            setTrades(Array.isArray(data) ? data : [])
        } catch {
            setError("Impossible de charger les trades.")
            setTrades([])
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        void load()
    }, [load])

    return { trades, isLoading, error, refetch: load }
}
