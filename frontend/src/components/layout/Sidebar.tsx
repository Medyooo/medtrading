import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    BarChart2,
    ChevronsLeft,
    ChevronsRight,
    LayoutDashboard,
    LineChart,
    LogOut,
    Settings,
    TrendingUp,
} from "lucide-react"
import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const SIDEBAR_COLLAPSED_KEY = "medtrading-sidebar-collapsed"

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Trades", icon: TrendingUp, path: "/trades" },
    { label: "Paires", icon: BarChart2, path: "/pairs" },
    { label: "Analyse", icon: LineChart, path: "/analysis" },
    { label: "Paramètres", icon: Settings, path: "/settings" },
]

function readCollapsedFromStorage(): boolean {
    try {
        return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
    } catch {
        return false
    }
}

export function Sidebar() {
    const location = useLocation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(readCollapsedFromStorage)

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "true" : "false")
        } catch {
            /* ignore */
        }
    }, [collapsed])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/login")
    }

    return (
        <TooltipProvider delayDuration={300}>
            <aside
                className={cn(
                    "flex h-full shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-out",
                    collapsed ? "w-16" : "w-64",
                )}
            >
                <div
                    className={cn(
                        "flex shrink-0 items-center border-b border-border",
                        collapsed
                            ? "flex-col gap-2 px-2 py-3"
                            : "h-16 justify-between gap-2 px-4",
                    )}
                >
                    <div
                        className={cn(
                            "flex min-w-0 items-center gap-2",
                            collapsed && "flex-col",
                        )}
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                            <TrendingUp className="size-4 text-white" aria-hidden />
                        </div>
                        {!collapsed ? (
                            <span className="truncate font-semibold tracking-tight">
                                MedTrading
                            </span>
                        ) : null}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setCollapsed((c) => !c)}
                        aria-expanded={!collapsed}
                        aria-controls="sidebar-nav"
                        aria-label={
                            collapsed
                                ? "Développer la barre latérale"
                                : "Réduire la barre latérale"
                        }
                    >
                        {collapsed ? (
                            <ChevronsRight className="size-4" aria-hidden />
                        ) : (
                            <ChevronsLeft className="size-4" aria-hidden />
                        )}
                    </Button>
                </div>

                <nav
                    id="sidebar-nav"
                    className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-4")}
                >
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const linkClass = cn(
                            "flex items-center rounded-lg text-sm transition-colors",
                            collapsed
                                ? "justify-center px-2 py-2.5"
                                : "gap-3 px-3 py-2",
                            isActive
                                ? "bg-emerald-600/10 font-medium text-emerald-600"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )

                        const link = (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={linkClass}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={collapsed ? item.label : undefined}
                            >
                                <item.icon className="size-4 shrink-0" aria-hidden />
                                {!collapsed ? item.label : null}
                            </Link>
                        )

                        if (collapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={6}>
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        }

                        return link
                    })}
                </nav>

                <div className={cn("shrink-0 border-t border-border", collapsed ? "p-2" : "p-4")}>
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    aria-label="Se déconnecter"
                                >
                                    <LogOut className="size-4 shrink-0" aria-hidden />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={6}>
                                Se déconnecter
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <LogOut className="size-4 shrink-0" aria-hidden />
                            Se déconnecter
                        </button>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    )
}
