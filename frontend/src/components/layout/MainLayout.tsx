import { Sidebar } from "@/components/layout/Sidebar"
import { TickerBar } from "@/components/layout/TickerBar"

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <TickerBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}