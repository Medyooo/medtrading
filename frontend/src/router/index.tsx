import { createBrowserRouter } from "react-router-dom"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ProtectedRoute from "@/router/ProtectedRoute.tsx";

export const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/", element: <LoginPage /> },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <div>Dashboard — coming soon</div>
            </ProtectedRoute>
        ),
    },
])
