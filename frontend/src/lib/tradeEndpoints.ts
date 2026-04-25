export const tradeEndpoints = {
    myTrades: "/trades/user/me",
    recent: "/trades/recent",
    stats: "/trades/stats",
    dailyPnl: "/trades/stats/daily-pnl",
    topPairs: "/trades/stats/top-pairs",
    pnlDistribution: "/trades/stats/distribution",
    create: "/trades",
    byId: (id: number) => `/trades/${id}`,
    close: (id: number) => `/trades/${id}/close`,
} as const
