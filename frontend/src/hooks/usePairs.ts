import { useCallback, useEffect, useState } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import { pairEndpoints } from "@/lib/pairEndpoints"
import type { Pair } from "@/types"

export function usePairs() {
    const token = useAppSelector((state) => state.auth.token)
    const [pairs, setPairs] = useState<Pair[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(token))

    const load = useCallback(async () => {
        if (!token) {
            setPairs([])
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        try {
            const data = await apiClient.get<Pair[]>(pairEndpoints.list, token)
            setPairs(Array.isArray(data) ? data : [])
        } catch {
            setPairs([])
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        void load()
    }, [load])

    return { pairs, isLoading, refetch: load }
}
