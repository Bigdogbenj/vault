import { useMemo } from 'react'
import { fmt, fmtNum } from '../utils'

const ASSET_COLOR = { crypto: '#f0a500', stocks: '#5b9ef0', etfs: '#4caf7d' }
const ASSET_LABEL = { crypto: 'Crypto', stocks: 'Stocks', etfs: 'ETF' }

export function Trades({ data }) {
  const trades = data.realizedTrades ?? []

  const stats = useMemo(() => {
    if (trades.length === 0) return null
    const totalPL = trades.reduce((s, t) => s + t.realizedPL, 0)
    const sorted = [...trades].sort((a, b) => b.realizedPL - a.realizedPL)
    return {
      totalPL,
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      count: trades.length,
    }
  }, [trades])

  const leaderboard = useMemo(() => {
    const byAsset = {}
    for (const t of trades) {
      const key = `${t.assetType}-${t.symbol}`
      byAsset[key] = byAsset[key] ?? { symbol: t.symbol, assetType: t.assetType, totalPL: 0, count: 0 }
      byAsset[key].totalPL += t.realizedPL
      byAsset[key].count++
    }
    return Object.values(byAsset).sort((a, b) => b.totalPL - a.totalPL)
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="page">
        <div className="page-title">Trades</div>
        <div className="page-subtitle">Realized gains &amp; losses from selling assets</div>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No trades yet</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Sell an asset from the Portfolio tab to start tracking realized P/L.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-title">Trades</div>
      <div className="page-subtitle">{stats.count} trade{stats.count !== 1 ? 's' : ''} · realized gains &amp; losses</div>

      {/* Stat row */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Total Realized P/L</div>
          <div className="stat-value" style={{ color: stats.totalPL >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {stats.totalPL >= 0 ? '+' : ''}{fmt(stats.totalPL)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Trade</div>
          <div className="stat-value text-green" style={{ fontSize: 20 }}>{stats.best.symbol}</div>
          <div className="stat-sub text-green">+{fmt(stats.best.realizedPL)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Worst Trade</div>
          <div className="stat-value" style={{ fontSize: 20, color: stats.worst.realizedPL < 0 ? 'var(--red)' : 'var(--text)' }}>
            {stats.worst.symbol}
          </div>
          <div className="stat-sub" style={{ color: stats.worst.realizedPL < 0 ? 'var(--red)' : 'var(--muted)' }}>
            {stats.worst.realizedPL >= 0 ? '+' : ''}{fmt(stats.worst.realizedPL)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{stats.count}</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Asset Leaderboard</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Asset</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Trades</th>
                <th style={{ textAlign: 'right' }}>Realized P/L</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((a, i) => (
                <tr key={`${a.assetType}-${a.symbol}`}>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{a.symbol}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${ASSET_COLOR[a.assetType]}18`, color: ASSET_COLOR[a.assetType] }}>
                      {ASSET_LABEL[a.assetType]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{a.count}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: a.totalPL >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {a.totalPL >= 0 ? '+' : ''}{fmt(a.totalPL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade History */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Trade History</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{trades.length} entries</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Asset</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Sale Price</th>
                <th style={{ textAlign: 'right' }}>Proceeds</th>
                <th style={{ textAlign: 'right' }}>Realized P/L</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.id}>
                  <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(t.soldAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.symbol}</td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{fmtNum(t.quantity, 6)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{fmt(t.priceAud)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(t.proceeds)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: t.realizedPL >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {t.realizedPL >= 0 ? '+' : ''}{fmt(t.realizedPL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
