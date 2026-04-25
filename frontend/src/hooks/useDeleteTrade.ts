import { useState, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { tradeEndpoints } from "@/lib/tradeEndpoints"

export function useDeleteTrade() {
    const token = useAppSelector((state) => state.auth.token)
    const [isLoading, setIsLoading] = useState(false)

    const deleteTrade = useCallback(
        async (tradeId: number) => {
            if (!token) throw new Error("Non connecté")
            setIsLoading(true)
            try {
                await apiClient.delete(tradeEndpoints.byId(tradeId), token)
            } finally {
                setIsLoading(false)
            }
        },
        [token],
    )

    return { deleteTrade, isLoading }
}
