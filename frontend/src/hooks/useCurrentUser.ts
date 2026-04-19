import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import { apiClient } from "@/lib/apiClient"
import type { User } from "@/types"

export const useCurrentUser = () => {
    const token = useAppSelector(state => state.auth.token)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await apiClient.get<User>("/users/me", token ?? undefined)
                setUser(data)
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        if (token) fetchUser()
    }, [token])

    return { user, isLoading }
}