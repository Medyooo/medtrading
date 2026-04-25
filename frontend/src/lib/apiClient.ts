import type { ApiError } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL

export const apiClient = {
    post: async <T>(url: string, body: unknown, token?: string): Promise<T> => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const error: ApiError = await response.json()
            throw error
        }

        return response.json()
    },

    get: async <T>(url: string, token?: string): Promise<T> => {
        const response = await fetch(`${BASE_URL}${url}`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        })

        if (!response.ok) {
            const error: ApiError = await response.json()
            throw error
        }

        return response.json()
    },

    delete: async <T>(url: string, token?: string): Promise<T | undefined> => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: "DELETE",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        })

        const text = await response.text()

        if (!response.ok) {
            try {
                const parsed = JSON.parse(text) as ApiError
                throw parsed
            } catch (e) {
                if (e && typeof e === "object" && "message" in e) throw e
            }
            throw {
                status: response.status,
                message: text.trim() || response.statusText,
                timestamp: new Date().toISOString(),
            } satisfies ApiError
        }

        if (!text.trim()) return undefined
        return JSON.parse(text) as T
    },

    put: async <T>(url: string, body: unknown, token?: string): Promise<T> => {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const error: ApiError = await response.json()
            throw error
        }

        return response.json()
    },
}