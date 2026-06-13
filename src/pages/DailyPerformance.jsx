import { useMemo } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt, resolvedAccountBalance } from '../utils'
import { useDailySnapshots } from '../hooks/useDailySnapshots'

const CAT_COLORS = { crypto: '#f0a500', stocks: '#5b9ef0', etfs: '#4caf7d' }
const NEG_COLOR = '#e05b5b'

function DeltaCell({ val }) {
  if (val == null) return <span style={{ color: 'var(--muted)' }}>—</span>
  const c = val >= 0 ? 'var(--green)' : 'var(--red)'
  return <span style={{ color: c }}>{val >= 0 ? '+' : ''}{fmt(val)}</span>
}

function PctCell({ val }) {
  if (val == null) return <span style={{ color: 'var(--muted)' }}>—</span>
  const c = val >= 0 ? 'var(--green)' : 'var(--red)'
  return <span style={{ color: c }}>{val >= 0 ? '+' : ''}{val.toFixed(2)}%</span>
}

function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export function DailyPerformance({ data, prices }) {
  const snapshots = useDailySnapshots()

  const livePricesLoaded = !!prices?.live

  // Computed outside the memo so midnight transitions take effect on the next
  // price-driven re-render rather than requiring a full remount.
  const today = new Date().toISOString().slice(0, 10)

  const yesterdaySnap = useMemo(() => {
    return snapshots.find(s => s.date < today) ?? null
  }, [snapshots, today])

  const currentTotal = useMemo(
    () => data.accounts.reduce((s, a) => s + resolvedAccountBalance(a, data, prices), 0),
    [data.accounts, data.crypto, data.stocks, data.etfs, prices] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const currentCrypto = useMemo(
    () => data.crypto.reduce((s, c) => s + c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0), 0),
    [data.crypto, prices]
  )
  const currentStocks = useMemo(
    () => data.stocks.reduce((s, st) => s + st.shares * (prices?.stocks?.[st.ticker]?.aud ?? 0), 0),
    [data.stocks, prices]
  )
  const currentEtfs = useMemo(
    () => data.etfs.reduce((s, e) => s + e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0), 0),
    [data.etfs, prices]
  )

  const totalChange = yesterdaySnap && livePricesLoaded ? currentTotal - yesterdaySnap.net_worth : null
  const totalPct = totalChange != null && yesterdaySnap.net_worth !== 0
    ? (totalChange / Math.abs(yesterdaySnap.net_worth)) * 100 : null

  const cryptoChange = yesterdaySnap && livePricesLoaded ? currentCrypto - (yesterdaySnap.crypto_value ?? 0) : null
  const stocksChange = yesterdaySnap && livePricesLoaded ? currentStocks - (yesterdaySnap.stocks_value ?? 0) : null
  const etfChange    = yesterdaySnap && livePricesLoaded ? currentEtfs   - (yesterdaySnap.etf_value   ?? 0) : null

  const topCategory = useMemo(() => {
    if (!yesterdaySnap || !livePricesLoaded) return null
    const cats = [
      { name: 'Crypto', change: cryptoChange },
      { name: 'Stocks', change: stocksChange },
      { name: 'ETFs',   change: etfChange },
    ]
    return cats.reduce((best, c) => (c.change ?? -Infinity) > (best.change ?? -Infinity) ? c : best, cats[0])
  }, [yesterdaySnap, livePricesLoaded, cryptoChange, stocksChange, etfChange])

  const currentAssetBreakdown = useMemo(() => {
    const bd = {}
    data.crypto.forEach(c => { bd[c.coinId]  = { symbol: c.symbol,  name: c.name, type: 'crypto',  value: c.amount  * (prices?.crypto?.[c.coinId]?.aud  ?? 0) } })
    data.stocks.forEach(s => { bd[s.ticker]  = { symbol: s.ticker,  name: s.name, type: 'stocks',  value: s.shares  * (prices?.stocks?.[s.ticker]?.aud  ?? 0) } })
    data.etfs.forEach(e   => { bd[e.ticker]  = { symbol: e.ticker,  name: e.name, type: 'etfs',    value: e.units   * (prices?.etfs?.[e.ticker]?.aud    ?? 0) } })
    return bd
  }, [data.crypto, data.stocks, data.etfs, prices])

  const topAsset = useMemo(() => {
    if (!yesterdaySnap || !livePricesLoaded) return null
    const prevBd = yesterdaySnap.asset_breakdown ?? {}
    let best = null
    for (const [id, cur] of Object.entries(currentAssetBreakdown)) {
      const change = cur.value - (prevBd[id]?.value ?? 0)
      if (best == null || change > best.change) best = { id, name: cur.name, symbol: cur.symbol, type: cur.type, change }
    }
    return best
  }, [currentAssetBreakdown, yesterdaySnap, livePricesLoaded])

  function makeRows(items, getKey, getValue, getSymbol) {
    const prevBd = yesterdaySnap?.asset_breakdown ?? null
    return items.map(item => {
      const key = getKey(item)
      const val = getValue(item)
      const prev = prevBd && livePricesLoaded ? (prevBd[key]?.value ?? null) : null
      const delta = prev != null ? val - prev : null
      const pct   = delta != null && prev !== 0 ? (delta / Math.abs(prev)) * 100 : null
      return { key, name: item.name, symbol: getSymbol ? getSymbol(item) : getKey(item), val, delta, pct }
    }).sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity))
  }

  const cryptoRows = useMemo(() => makeRows(
    data.crypto.filter(c => c.amount > 0),
    c => c.coinId,
    c => c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0),
    c => c.symbol
  ), [data.crypto, prices, yesterdaySnap, livePricesLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const stocksRows = useMemo(() => makeRows(
    data.stocks.filter(s => s.shares > 0),
    s => s.ticker,
    s => s.shares * (prices?.stocks?.[s.ticker]?.aud ?? 0)
  ), [data.stocks, prices, yesterdaySnap, livePricesLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const etfRows = useMemo(() => makeRows(
    data.etfs.filter(e => e.units > 0),
    e => e.ticker,
    e => e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0)
  ), [data.etfs, prices, yesterdaySnap, livePricesLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const history = useMemo(() => {
    const last30 = snapshots.slice(0, 30)
    return last30.map((snap, i) => {
      const prev = snapshots[i + 1] ?? null
      const delta = prev ? snap.net_worth - prev.net_worth : null
      const pct   = delta != null && prev.net_worth !== 0 ? (delta / Math.abs(prev.net_worth)) * 100 : null
      let topA = null
      if (prev && snap.asset_breakdown && prev.asset_breakdown) {
        for (const [id, cur] of Object.entries(snap.asset_breakdown)) {
          const change = cur.value - (prev.asset_breakdown[id]?.value ?? 0)
          if (topA == null || change > topA.change) topA = { name: cur.name, symbol: cur.symbol, change }
        }
      }
      return { date: snap.date, netWorth: snap.net_worth, delta, pct, topAsset: topA }
    })
  }, [snapshots])

  const histStats = useMemo(() => {
    const withChanges = history.filter(h => h.delta != null)
    if (withChanges.length === 0) return null
    const best  = withChanges.reduce((a, b) => b.delta > a.delta ? b : a)
    const worst = withChanges.reduce((a, b) => b.delta < a.delta ? b : a)
    const avg   = withChanges.reduce((s, h) => s + h.delta, 0) / withChanges.length
    const assetTotals = {}
    snapshots.slice(0, 30).forEach((snap, i) => {
      const prev = snapshots[i + 1]
      if (!prev || !snap.asset_breakdown || !prev.asset_breakdown) return
      for (const [id, cur] of Object.entries(snap.asset_breakdown)) {
        const change = cur.value - (prev.asset_breakdown[id]?.value ?? 0)
        if (!assetTotals[id]) assetTotals[id] = { name: cur.name, symbol: cur.symbol, total: 0 }
        assetTotals[id].total += change
      }
    })
    const vals = Object.values(assetTotals)
    const bestAsset = vals.length > 0
      ? vals.reduce((a, b) => b.total > a.total ? b : a)
      : { name: '—', symbol: '—', total: 0 }
    return { best, worst, avg, bestAsset }
  }, [history, snapshots])

  const barData = [
    { name: 'Crypto', change: cryptoChange ?? 0, color: cryptoChange != null && cryptoChange < 0 ? NEG_COLOR : CAT_COLORS.crypto },
    { name: 'Stocks', change: stocksChange ?? 0, color: stocksChange != null && stocksChange < 0 ? NEG_COLOR : CAT_COLORS.stocks },
    { name: 'ETFs',   change: etfChange ?? 0,    color: etfChange    != null && etfChange    < 0 ? NEG_COLOR : CAT_COLORS.etfs   },
  ]

  function catPct(change, prevVal) {
    if (change == null || prevVal == null || prevVal === 0) return null
    return (change / Math.abs(prevVal)) * 100
  }

  const sections = [
    { label: 'Crypto', color: CAT_COLORS.crypto, total: currentCrypto, change: cryptoChange, pc: catPct(cryptoChange, yesterdaySnap?.crypto_value), rows: cryptoRows },
    { label: 'Stocks', color: CAT_COLORS.stocks, total: currentStocks, change: stocksChange, pc: catPct(stocksChange, yesterdaySnap?.stocks_value), rows: stocksRows },
    { label: 'ETFs',   color: CAT_COLORS.etfs,   total: currentEtfs,   change: etfChange,    pc: catPct(etfChange,    yesterdaySnap?.etf_value),    rows: etfRows   },
  ]

  return (
    <div className="page">
      {/* A. Today's Portfolio Performance */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Today's Portfolio Performance
        </div>
        {!livePricesLoaded && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Loading live prices…</div>
        )}
        {livePricesLoaded && !yesterdaySnap && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No yesterday snapshot yet — come back tomorrow</div>
        )}
      </div>

      <div className="grid-4">
        <div className="stat-card" style={{ borderColor: totalChange == null ? 'var(--border)' : totalChange >= 0 ? 'rgba(76,175,125,0.2)' : 'rgba(224,91,91,0.25)' }}>
          <div className="stat-label">Today's $ Change</div>
          <div className="stat-value" style={{ color: totalChange == null ? 'var(--muted)' : totalChange >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {totalChange == null ? '—' : `${totalChange >= 0 ? '+' : ''}${fmt(totalChange)}`}
          </div>
          <div className="stat-sub">vs yesterday's portfolio</div>
        </div>

        <div className="stat-card" style={{ borderColor: totalPct == null ? 'var(--border)' : totalPct >= 0 ? 'rgba(76,175,125,0.2)' : 'rgba(224,91,91,0.25)' }}>
          <div className="stat-label">Today's % Change</div>
          <div className="stat-value" style={{ color: totalPct == null ? 'var(--muted)' : totalPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {totalPct == null ? '—' : `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(2)}%`}
          </div>
          <div className="stat-sub">vs yesterday's portfolio</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{topCategory ? topCategory.name : '—'}</div>
          <div className="stat-sub" style={{ color: topCategory && topCategory.change != null && topCategory.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {topCategory && topCategory.change != null
              ? `${topCategory.change >= 0 ? '+' : ''}${fmt(topCategory.change)}`
              : 'No data yet'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Top Asset</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{topAsset ? topAsset.symbol : '—'}</div>
          <div className="stat-sub" style={{ color: topAsset && topAsset.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {topAsset ? `${topAsset.change >= 0 ? '+' : ''}${fmt(topAsset.change)} today` : 'No data yet'}
          </div>
        </div>
      </div>

      {/* Category bar chart */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Category Changes Today</span>
        </div>
        {!livePricesLoaded || !yesterdaySnap ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            {!livePricesLoaded ? 'Waiting for live prices…' : 'No yesterday snapshot — data builds up after the first day'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 8, right: 16, bottom: 0, left: 16 }} style={{ background: 'transparent' }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} width={50} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} labelStyle={{ color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} formatter={v => [`${v >= 0 ? '+' : ''}${fmt(v)}`, 'Change']} />
              <Bar dataKey="change" radius={[4, 4, 0, 0]} background={{ fill: 'transparent' }}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* B. Asset class breakdowns */}
      {sections.map(({ label, color, total, change, pc, rows }) => (
        <div key={label} className="card">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />
              <span className="section-title">{label}</span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color }}>{fmt(total)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
              <span style={{ color: change == null ? 'var(--muted)' : change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {change == null ? '—' : `${change >= 0 ? '+' : ''}${fmt(change)}`}
              </span>
              {pc != null && (
                <span style={{ color: pc >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
                  ({pc >= 0 ? '+' : ''}{pc.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
          <div className="desktop-table table-scroll-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>Asset</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Current Value</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Today's $ Change</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Today's % Change</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <div style={{ fontWeight: 600 }}>{row.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.name}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{fmt(row.val)}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}><DeltaCell val={row.delta} /></td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}><PctCell val={row.pct} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-cards">
            {rows.map(row => (
              <div key={row.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{row.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>{fmt(row.val)}</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2, fontSize: 12 }}>
                    <DeltaCell val={row.delta} />
                    <PctCell val={row.pct} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* C. Daily Performance History */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Daily Performance History</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>last 30 days</span>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            No history yet — snapshots are taken daily when prices load
          </div>
        ) : (
          <>
          <div className="desktop-table table-scroll-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Net Worth</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>$ Change</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>% Change</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 500 }}>Top Asset</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.date} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>{fmtDate(h.date)}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{fmt(h.netWorth)}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}><DeltaCell val={h.delta} /></td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}><PctCell val={h.pct} /></td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}>
                      {h.topAsset ? (
                        <span>
                          <span style={{ fontWeight: 600 }}>{h.topAsset.symbol}</span>{' '}
                          <span style={{ color: h.topAsset.change >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                            {h.topAsset.change >= 0 ? '+' : ''}{fmt(h.topAsset.change)}
                          </span>
                        </span>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-cards">
            {history.map(h => (
              <div key={h.date} style={{
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(h.date)}</span>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>{fmt(h.netWorth)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <DeltaCell val={h.delta} />
                  <PctCell val={h.pct} />
                </div>
                {h.topAsset && (
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>
                    Top: <span style={{ fontWeight: 600 }}>{h.topAsset.symbol}</span>{' '}
                    <span style={{ color: h.topAsset.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {h.topAsset.change >= 0 ? '+' : ''}{fmt(h.topAsset.change)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
        )}

        {histStats && (
          <div className="grid-4" style={{ marginTop: 20 }}>
            <div className="stat-card">
              <div className="stat-label">Best Day</div>
              <div className="stat-value" style={{ color: 'var(--green)', fontSize: 20 }}>+{fmt(histStats.best.delta)}</div>
              <div className="stat-sub">{fmtDateShort(histStats.best.date)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Worst Day</div>
              <div className="stat-value" style={{ color: 'var(--red)', fontSize: 20 }}>{fmt(histStats.worst.delta)}</div>
              <div className="stat-sub">{fmtDateShort(histStats.worst.date)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Daily Change</div>
              <div className="stat-value" style={{ color: histStats.avg >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 20 }}>
                {histStats.avg >= 0 ? '+' : ''}{fmt(histStats.avg)}
              </div>
              <div className="stat-sub">mean over {history.filter(h => h.delta != null).length} days</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best Asset Overall</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{histStats.bestAsset.symbol}</div>
              <div className="stat-sub" style={{ color: histStats.bestAsset.total >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {histStats.bestAsset.total >= 0 ? '+' : ''}{fmt(histStats.bestAsset.total)} total
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
