import { Link } from "react-router-dom"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { PnlChart } from "@/components/dashboard/PnlChart"
import { TopPairsChart } from "@/components/dashboard/TopPairsChart"
import { LatestTradesTable } from "@/components/dashboard/LatestTradesTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart2, Target, Trophy, AlertTriangle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
    const { user } = useCurrentUser()
    const { stats, dailyPnl, topPairs, recentTrades, isLoading } = useDashboardStats()

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-72 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-44 shrink-0 rounded-full" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                    <Skeleton className="h-72 lg:col-span-2" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Bonjour, {user?.username} 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Voici un aperçu de vos performances
                    </p>
                </div>
                <Button
                    asChild
                    size="lg"
                    className={cn(
                        "h-10 shrink-0 gap-2 rounded-full border border-emerald-900/40 px-5 text-sm font-medium",
                        "bg-emerald-950 text-emerald-300 shadow-sm",
                        "hover:bg-emerald-900 hover:text-emerald-200",
                        "dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-200",
                        "dark:hover:bg-emerald-900 dark:hover:text-emerald-100",
                    )}
                >
                    <Link to="/trades">
                        <Plus className="size-4 stroke-[2.25]" aria-hidden />
                        Nouveau trade
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total trades
                        </CardTitle>
                        <BarChart2 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalTrades ?? 0}</p>
                        <p className="text-xs text-muted-foreground">
                            {stats?.openTrades ?? 0} ouverts · {stats?.closedTrades ?? 0} fermés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Win Rate
                        </CardTitle>
                        <Target className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p
                            className={cn(
                                "text-2xl font-bold",
                                (stats?.winRate ?? 0) >= 50 ? "text-emerald-500" : "text-red-500",
                            )}
                        >
                            {stats?.winRate ?? 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stats?.winningTrades ?? 0} gagnants · {stats?.losingTrades ?? 0} perdants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            P&L Total
                        </CardTitle>
                        {(stats?.totalPnl ?? 0) >= 0 ? (
                            <TrendingUp className="size-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="size-4 text-red-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <p
                            className={cn(
                                "text-2xl font-bold",
                                (stats?.totalPnl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500",
                            )}
                        >
                            {(stats?.totalPnl ?? 0) >= 0 ? "+" : ""}
                            {stats?.totalPnl ?? 0}$
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Sur tous les trades fermés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Meilleur trade
                        </CardTitle>
                        <Trophy className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-emerald-500">
                            +{stats?.bestTrade ?? 0}$
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="size-3 text-red-500" />
                            Pire : {stats?.worstTrade ?? 0}$
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <PnlChart data={dailyPnl} />
                <TopPairsChart data={topPairs} />
                <div className="lg:col-span-2">
                    <LatestTradesTable trades={recentTrades} />
                </div>
            </div>
        </div>
    )
}
