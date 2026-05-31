import { useState, useEffect, useRef } from 'react'

const FALLBACK_USD_AUD = 1.55

export function usePrices(crypto = [], stocks = [], etfs = []) {
  const [prices, setPrices] = useState({ crypto: {}, stocks: {}, etfs: {}, usdToAud: FALLBACK_USD_AUD, live: false, lastUpdated: null })
  const mountedRef = useRef(true)

  const coinIdsKey = crypto.map(c => c.coinId).join(',')
  const stockTickersKey = stocks.map(s => s.ticker).join(',')
  const etfTickersKey = etfs.map(e => e.yahooTicker ?? e.ticker + '.AX').join(',')

  useEffect(() => {
    mountedRef.current = true

    async function fetchAll() {
      const results = { crypto: {}, stocks: {}, etfs: {}, usdToAud: FALLBACK_USD_AUD, live: false, lastUpdated: null }

      // Fetch USD→AUD exchange rate
      try {
        const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
        const d = await r.json()
        results.usdToAud = d.usd?.aud ?? FALLBACK_USD_AUD
      } catch {}

      // Fetch crypto from CoinGecko (CORS-friendly)
      try {
        const ids = crypto.map(c => c.coinId).join(',')
        if (ids) {
          const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=aud,usd&include_24hr_change=true`)
          const d = await r.json()
          results.crypto = d
          results.live = true
        }
      } catch {}

      // Fetch US stock prices via Vite proxy → Yahoo Finance
      for (const s of stocks) {
        try {
          const r = await fetch(`/api/yahoo/v8/finance/chart/${s.ticker}?interval=1d&range=1d`)
          const d = await r.json()
          const meta = d.chart?.result?.[0]?.meta
          if (meta?.regularMarketPrice) {
            const price = meta.regularMarketPrice
            const prev = meta.chartPreviousClose ?? price
            results.stocks[s.ticker] = {
              usd: price,
              aud: price * results.usdToAud,
              change24h: ((price - prev) / prev) * 100,
            }
          }
        } catch {}
      }

      // Fetch ETF prices via proxy; fall back to manualPriceAud when live data unavailable
      for (const e of etfs) {
        const isUs = e.market === 'US'
        const yahooTicker = e.yahooTicker ?? (isUs ? e.ticker : e.ticker + '.AX')
        let fetched = false
        try {
          const r = await fetch(`/api/yahoo/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`)
          const d = await r.json()
          const meta = d.chart?.result?.[0]?.meta
          if (meta?.regularMarketPrice) {
            const raw = meta.regularMarketPrice
            const prevRaw = meta.chartPreviousClose ?? raw
            results.etfs[e.ticker] = {
              aud: isUs ? raw * results.usdToAud : raw,
              usd: isUs ? raw : raw / results.usdToAud,
              change24h: ((raw - prevRaw) / prevRaw) * 100,
              manual: false,
            }
            fetched = true
          }
        } catch {}
        if (!fetched && e.manualPriceAud != null) {
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
    const iv = setInterval(fetchAll, 60000)
    return () => {
      mountedRef.current = false
      clearInterval(iv)
    }
  }, [coinIdsKey, stockTickersKey, etfTickersKey])

  return prices
}
