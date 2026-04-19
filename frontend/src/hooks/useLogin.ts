import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/authSlice"
import { apiClient } from "@/lib/apiClient"
import type { AuthResponse, ApiError } from "@/types"

interface LoginData {
    email: string
    password: string
}

export const useLogin = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (data: LoginData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await apiClient.post<AuthResponse>("/auth/login", data)

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
            setError(apiError.message ?? "Erreur de connexion")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}