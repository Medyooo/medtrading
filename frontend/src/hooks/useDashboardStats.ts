import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import type { TradeStats, Trade, DailyPnl, TopPair } from "@/types"

export const useDashboardStats = () => {
    const token = useAppSelector((state) => state.auth.token)
    const [stats, setStats] = useState<TradeStats | null>(null)
    const [dailyPnl, setDailyPnl] = useState<DailyPnl[]>([])
    const [topPairs, setTopPairs] = useState<TopPair[]>([])
    const [recentTrades, setRecentTrades] = useState<Trade[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsData, dailyData, topPairsData, recentData] = await Promise.all([
                    apiClient.get<TradeStats>("/trades/stats", token ?? undefined),
                    apiClient.get<DailyPnl[]>("/trades/stats/daily-pnl", token ?? undefined),
                    apiClient.get<TopPair[]>("/trades/stats/top-pairs", token ?? undefined),
                    apiClient.get<Trade[]>("/trades/recent", token ?? undefined),
                ])

                setStats(statsData)
                setDailyPnl(dailyData)
                setTopPairs(topPairsData)
                setRecentTrades(recentData)
            } catch {
                console.error("Erreur chargement dashboard")
            } finally {
                setIsLoading(false)
            }
        }

        if (token) fetchAll()
    }, [token])

    return { stats, dailyPnl, topPairs, recentTrades, isLoading }
}
