import { useEffect } from "react"

export function TickerBar() {
    useEffect(() => {
        const script = document.createElement("script")
        script.type = "module"
        script.src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    return (
        <div className="w-full border-b border-border">
            {/* @ts-ignore */}
            <tv-ticker-tape
                symbols="OANDA:XAUUSD,OANDA:XAGUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FOREXCOM:SPXUSD,FX:EURUSD,FX:GBPUSD,FX:USDJPY,FX:USDCHF,FX:AUDUSD,FX:USDCAD,FX:NZDUSD,FX:EURJPY,FX:EURGBP,FX:GBPJPY,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD"
                item-size="compact"
                show-hover
            />
        </div>
    )
}