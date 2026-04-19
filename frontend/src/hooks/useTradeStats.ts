import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import type { TradeStats } from "@/types"

export const useTradeStats = () => {
    const token = useAppSelector(state => state.auth.token)
    const [stats, setStats] = useState<TradeStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.get<TradeStats>(
                    `/trades/stats`,
                    token ?? undefined
                )
                setStats(data)
            } catch {
                setError("Erreur lors du chargement des stats")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [token])

    return { stats, isLoading, error }
}