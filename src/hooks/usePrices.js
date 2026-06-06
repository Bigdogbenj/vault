import { useState, useEffect, useRef } from 'react'

const FALLBACK_USD_AUD = 1.55

export function usePrices(crypto = [], stocks = [], etfs = []) {
  const [prices, setPrices] = useState({
    crypto: {}, stocks: {}, etfs: {},
    usdToAud: FALLBACK_USD_AUD,
    live: false,
    lastUpdated: null,
  })
  const mountedRef = useRef(true)

  const coinIdsKey     = crypto.map(c => c.coinId).join(',')
  const stockTickersKey = stocks.map(s => s.ticker).join(',')
  const etfTickersKey  = etfs.map(e => e.yahooTicker ?? (e.market === 'US' ? e.ticker : e.ticker + '.AX')).join(',')

  useEffect(() => {
    mountedRef.current = true

    async function fetchAll() {
      const results = {
        crypto: {}, stocks: {}, etfs: {},
        usdToAud: FALLBACK_USD_AUD,
        live: false,
        lastUpdated: null,
      }

      // ── 1. USD → AUD exchange rate ──────────────────────────────────────
      try {
        const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
        const d = await r.json()
        results.usdToAud = d.usd?.aud ?? FALLBACK_USD_AUD
      } catch {}

      // ── 2. Crypto prices from CoinGecko ─────────────────────────────────
      try {
        const ids = crypto.map(c => c.coinId).join(',')
        if (ids) {
          const r = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=aud,usd&include_24hr_change=true`
          )
          const d = await r.json()
          results.crypto = d
          results.live = true
        }
      } catch {}

      // ── 3. Stocks + ETFs via Vite dev-server proxy (yahoo-finance2) ──────
      // Build the combined symbol list for a single batch request.
      const stockSymbols = stocks.map(s => s.ticker)
      const etfYahooMap  = Object.fromEntries(
        etfs.map(e => [e.yahooTicker ?? (e.market === 'US' ? e.ticker : e.ticker + '.AX'), e])
      )
      const etfSymbols = Object.keys(etfYahooMap)
      const allYahooSymbols = [...stockSymbols, ...etfSymbols]

      if (allYahooSymbols.length > 0) {
        try {
          const r = await fetch(`/api/quotes?symbols=${allYahooSymbols.join(',')}`)
          if (r.ok) {
            const quotes = await r.json()
            if (Array.isArray(quotes)) {
              for (const q of quotes) {
                const price   = q.regularMarketPrice
                const change  = q.regularMarketChangePercent ?? null
                const isUSD   = q.currency === 'USD'

                // Match to stock
                if (stockSymbols.includes(q.symbol)) {
                  results.stocks[q.symbol] = {
                    usd: price,
                    aud: price * results.usdToAud,
                    change24h: change,
                  }
                  results.live = true
                }

                // Match to ETF by Yahoo ticker
                const etf = etfYahooMap[q.symbol]
                if (etf) {
                  results.etfs[etf.ticker] = {
                    aud: isUSD ? price * results.usdToAud : price,
                    usd: isUSD ? price : price / results.usdToAud,
                    change24h: change,
                    manual: false,
                  }
                  results.live = true
                }
              }
            }
          }
        } catch {}
      }

      // ── 4. ETF manual price fallback (when dev server isn't running) ─────
      for (const e of etfs) {
        if (!results.etfs[e.ticker] && e.manualPriceAud != null) {
          results.etfs[e.ticker] = {
            aud: e.manualPriceAud,
            usd: e.manualPriceAud / results.usdToAud,
            change24h: null,
            manual: true,
          }
        }
      }

      results.lastUpdated = new Date()
      if (mountedRef.current) setPrices(results)
    }

    fetchAll()
    const iv = setInterval(fetchAll, 60_000)
    return () => {
      mountedRef.current = false
      clearInterval(iv)
    }
  }, [coinIdsKey, stockTickersKey, etfTickersKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return prices
}
