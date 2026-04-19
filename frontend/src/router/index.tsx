import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import ProtectedRoute from "@/router/ProtectedRoute"
import DashboardPage from "@/pages/DashboardPage.tsx";
import AnalysisPage from "@/pages/AnalysisPage.tsx";

export const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/", element: <LoginPage /> },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <DashboardPage />
                </MainLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/trades",
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <div>Trades — coming soon</div>
                </MainLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/pairs",
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <div>Pairs — coming soon</div>
                </MainLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/analysis",
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <AnalysisPage />
                </MainLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/settings",
        element: (
            <ProtectedRoute>
                <MainLayout>
                    <SettingsPage />
                </MainLayout>
            </ProtectedRoute>
        ),
    },
])
