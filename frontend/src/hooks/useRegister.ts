import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/authSlice"
import { apiClient } from "@/lib/apiClient"
import type { AuthResponse, ApiError } from "@/types"

interface RegisterData {
    username: string
    email: string
    password: string
}

export const useRegister = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const register = async (data: RegisterData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await apiClient.post<AuthResponse>("/auth/register", data)

            dispatch(setCredentials({
                user: {
                    username: result.username,
                    email: result.email,
                },
                token: result.token,
            }))

            navigate("/dashboard")
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.message ?? "Erreur lors de l'inscription")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return { register, isLoading, error }
}