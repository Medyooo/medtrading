import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { tradeEndpoints } from "@/lib/tradeEndpoints"
import type { TradeStats, Trade, DailyPnl, TopPair } from "@/types"

export function useDashboardStats() {
    const token = useAppSelector((state) => state.auth.token)
    const [stats, setStats] = useState<TradeStats | null>(null)
    const [dailyPnl, setDailyPnl] = useState<DailyPnl[]>([])
    const [topPairs, setTopPairs] = useState<TopPair[]>([])
    const [recentTrades, setRecentTrades] = useState<Trade[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(token))

    useEffect(() => {
        if (!token) {
            setStats(null)
            setDailyPnl([])
            setTopPairs([])
            setRecentTrades([])
            setIsLoading(false)
            return
        }

        let cancelled = false
        setIsLoading(true)

        const fetchAll = async () => {
            try {
                const [statsData, dailyData, topPairsData, recentData] = await Promise.all([
                    apiClient.get<TradeStats>(tradeEndpoints.stats, token),
                    apiClient.get<DailyPnl[]>(tradeEndpoints.dailyPnl, token),
                    apiClient.get<TopPair[]>(tradeEndpoints.topPairs, token),
                    apiClient.get<Trade[]>(tradeEndpoints.recent, token),
                ])
                if (cancelled) return
                setStats(statsData)
                setDailyPnl(Array.isArray(dailyData) ? dailyData : [])
                setTopPairs(Array.isArray(topPairsData) ? topPairsData : [])
                setRecentTrades(Array.isArray(recentData) ? recentData : [])
            } catch {
                if (!cancelled) {
                    setStats(null)
                    setDailyPnl([])
                    setTopPairs([])
                    setRecentTrades([])
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        void fetchAll()
        return () => {
            cancelled = true
        }
    }, [token])

    return { stats, dailyPnl, topPairs, recentTrades, isLoading }
}
