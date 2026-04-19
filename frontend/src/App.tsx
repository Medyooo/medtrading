import { RouterProvider } from "react-router-dom"
import { AppHeader } from "@/components/layout/AppHeader"
import { router } from "@/router"

export default function App() {
    return (
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
            <AppHeader
                placement="fixed"
                themeToggleVariant="floating"
                subtitle="Journal de trades et performance"
            />
            <div className="relative flex min-h-0 flex-1 flex-col">
                <RouterProvider router={router} />
            </div>
        </div>
    )
}
