import { useMemo } from 'react'
import { fmtFull } from '../utils'

const fmtUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0)

function TickerItem({ label, price, currency, change, manual }) {
  const sign = change >= 0 ? '+' : ''
  const color = change >= 0 ? 'var(--green)' : 'var(--red)'
  const arrow = change >= 0 ? '▲' : '▼'
  const priceStr = currency === 'AUD' ? fmtFull(price) : fmtUSD(price)
  return (
    <span className="ticker-item">
      <span className="ticker-symbol">{label}</span>
      <span className="ticker-price">
        {priceStr}
        {manual && <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 3 }}>est</span>}
      </span>
      {change != null && !isNaN(change) && (
        <span className="ticker-change" style={{ color }}>
          {arrow} {sign}{Math.abs(change).toFixed(2)}%
        </span>
      )}
    </span>
  )
}

export function Ticker({ data, prices }) {
  const items = useMemo(() => {
    const usdToAud = prices?.usdToAud ?? 1.55
    const list = []

    data.stocks.forEach(s => {
      const p = prices?.stocks?.[s.ticker]
      if (p?.usd != null) list.push({ id: s.ticker, label: s.ticker, price: p.usd, currency: 'USD', change: p.change24h ?? null })
    })

    data.etfs.forEach(e => {
      const p = prices?.etfs?.[e.ticker]
      if (p?.aud != null) list.push({ id: e.ticker, label: e.ticker, price: p.aud, currency: 'AUD', change: p.change24h ?? null, manual: p.manual ?? false })
    })

    data.crypto.forEach(c => {
      const p = prices?.crypto?.[c.coinId]
      const price = p?.usd ?? (p?.aud != null ? p.aud / usdToAud : null)
      if (price != null) list.push({ id: c.symbol, label: c.symbol, price, currency: 'USD', change: p.usd_24h_change ?? p.aud_24h_change ?? null })
    })

    return list
  }, [data, prices])

  const duration = `${Math.max(20, items.length * 5)}s`

  return (
    <div className="ticker-strip">
      {items.length === 0 ? (
        <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 16px' }}>Fetching prices…</span>
      ) : (
        <div className="ticker-track" style={{ animationDuration: duration }}>
          {[...items, ...items].map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      )}
    </div>
  )
}
