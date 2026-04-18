
export interface User {
    username: string
    email: string
}

export interface AuthResponse {
    token: string
    email: string
    username: string
}


export interface Pair {
    id: number
    symbol: string
    name: string
    baseCurrency: string
    quoteCurrency: string
}


export type TradeDirection = "BUY" | "SELL"
export type TradeStatus = "OPEN" | "CLOSED"

export interface Trade {
    id: number
    pairSymbol: string
    direction: TradeDirection
    entryPrice: number
    exitPrice?: number
    stopLoss?: number
    takeProfit?: number
    lotSize: number
    profitLoss?: number
    status: TradeStatus
    strategy?: string
    timeframe?: string
    notes?: string
    openedAt: string
    closedAt?: string
}

export interface TradeStats {
    totalTrades: number
    openTrades: number
    closedTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalPnl: number
    bestTrade: number
    worstTrade: number
}


export interface ApiError {
    status: number
    message: string
    detail?: string
    timestamp: string
}