import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fmt, fmtFull, fmtNum, genId } from '../utils'
import { Modal } from '../components/Modal'

function buildProjection(currentVal, weeklySavings, weeks) {
  const pts = []
  const step = Math.max(1, Math.floor(weeks / 20))
  for (let w = 0; w <= weeks; w += step) {
    pts.push({ week: w, value: Math.round(currentVal + w * weeklySavings) })
  }
  const last = pts[pts.length - 1]
  if (!last || last.week !== weeks) pts.push({ week: weeks, value: Math.round(currentVal + weeks * weeklySavings) })
  return pts
}

function AllocModal({ assets, onClose, onSave }) {
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '')
  const [amount, setAmount] = useState(50)
  const selected = assets.find(a => a.id === assetId)
  return (
    <Modal title="Add Weekly Allocation" onClose={onClose} size="modal-sm">
      <div className="form-group">
        <label className="form-label">Asset</label>
        <select className="form-select" value={assetId} onChange={e => setAssetId(e.target.value)}>
          {assets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Weekly Amount (AUD)</label>
        <input className="form-input" type="number" step="10" min="0" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => {
          if (selected) onSave({ id: genId(), assetType: selected.type, symbol: selected.symbol, amount })
        }}>Add</button>
      </div>
    </Modal>
  )
}

export function Calculator({ data, updateData, prices }) {
  const [tab, setTab] = useState('crypto')
  const [selectedId, setSelectedId] = useState('')
  const [target, setTarget] = useState(10000)
  const [weeklySavings, setWeeklySavings] = useState(100)
  const [allocModal, setAllocModal] = useState(false)

  const allAssets = useMemo(() => {
    const assets = []
    data.crypto.forEach(c => {
      const price = prices?.crypto?.[c.coinId]?.aud ?? null
      assets.push({ id: c.id, label: `${c.symbol} – ${c.name}`, type: 'crypto', symbol: c.symbol, coinId: c.coinId, held: c.amount, price })
    })
    data.stocks.forEach(s => {
      const price = prices?.stocks?.[s.ticker]?.aud ?? null
      assets.push({ id: s.id, label: `${s.ticker} – ${s.name}`, type: 'stocks', symbol: s.ticker, held: s.shares, price })
    })
    data.etfs.forEach(e => {
      const price = prices?.etfs?.[e.ticker]?.aud ?? null
      assets.push({ id: e.id, label: `${e.ticker} – ${e.name}`, type: 'etfs', symbol: e.ticker, held: e.units, price })
    })
    return assets
  }, [data, prices])

  const tabAssets = useMemo(() => allAssets.filter(a => a.type === tab), [allAssets, tab])

  const activeId = selectedId || tabAssets[0]?.id
  const selected = tabAssets.find(a => a.id === activeId) ?? tabAssets[0]

  const calc = useMemo(() => {
    if (!selected?.price || selected.price <= 0) return null
    const price = selected.price
    const currentValue = selected.held * price
    const stillNeeded = Math.max(0, target - currentValue)
    const weeks = weeklySavings > 0 ? Math.ceil(stillNeeded / weeklySavings) : Infinity
    const months = isFinite(weeks) ? (weeks / 4.333).toFixed(1) : null
    const unitsNeeded = stillNeeded / price
    return { price, currentValue, stillNeeded, weeks: isFinite(weeks) ? weeks : null, months, unitsNeeded }
  }, [selected, target, weeklySavings])

  const projData = useMemo(() => {
    if (!calc?.weeks || calc.weeks <= 0) return []
    return buildProjection(calc.currentValue, weeklySavings, calc.weeks)
  }, [calc, weeklySavings])

  const totalWeekly = data.weeklyAllocations.reduce((s, a) => s + a.amount, 0)

  const updateAlloc = (id, amount) => {
    updateData('weeklyAllocations', data.weeklyAllocations.map(a => a.id === id ? { ...a, amount } : a))
  }

  return (
    <div className="page">
      {/* Calculator */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Investment Calculator</div>
        <div className="tabs">
          {['crypto', 'stocks', 'etfs'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setSelectedId('') }}>
              {t === 'etfs' ? 'ETFs' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Asset</label>
            <select className="form-select" value={activeId} onChange={e => setSelectedId(e.target.value)}>
              {tabAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label}{a.price ? ` — ${fmtFull(a.price)}` : ' — no price'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target Value (AUD)</label>
            <input className="form-input" type="number" step="100" min="0" value={target} onChange={e => setTarget(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Currently Held ({tab === 'stocks' ? 'shares' : tab === 'etfs' ? 'units' : 'coins'})</label>
            <input
              className="form-input"
              type="number"
              step="any"
              value={selected?.held ?? 0}
              readOnly
              style={{ opacity: 0.6 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Weekly Savings (AUD)</label>
            <input className="form-input" type="number" step="10" min="0" value={weeklySavings} onChange={e => setWeeklySavings(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      {calc ? (
        <>
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-label">Weeks to Target</div>
              <div className="stat-value text-amber">{calc.weeks !== null ? calc.weeks : '∞'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Months to Target</div>
              <div className="stat-value text-blue">{calc.months ?? '∞'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Still Needed</div>
              <div className="stat-value" style={{ color: calc.stillNeeded > 0 ? 'var(--red)' : 'var(--green)' }}>
                {calc.stillNeeded > 0 ? fmt(calc.stillNeeded) : 'Reached! 🎉'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Current Value</div>
              <div className="stat-value text-green">{fmt(calc.currentValue)}</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  ['Asset', selected?.label],
                  ['Asset Price', fmtFull(calc.price)],
                  ['Target', fmt(target)],
                  ['Already Own', `${fmtNum(selected?.held, 4)} units`],
                  ['Current Value', fmt(calc.currentValue)],
                  ['Total Cost (AUD)', fmt(target)],
                  ['Units Still Needed', fmtNum(calc.unitsNeeded, 4)],
                  ['Weekly Investment', fmt(weeklySavings)],
                  ['Time to Goal', calc.weeks !== null ? `${calc.weeks} wks · ${calc.months} months` : 'Already there!'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>{label}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {projData.length > 1 && calc.weeks !== null && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 14 }}>Growth Projection</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={projData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={40} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v), 'Portfolio Value']} labelFormatter={v => `Week ${v}`} labelStyle={{ color: 'var(--muted)' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--amber)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
          {selected ? 'No live price available for this asset — prices update every 60 seconds' : 'Select an asset above to calculate'}
        </div>
      )}

      {/* Weekly Allocation Planner */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Weekly Allocation Planner</div>
            <div className="text-sm text-muted mt-1">Total: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{fmt(totalWeekly)}/week</span></div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAllocModal(true)}>+ Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.weeklyAllocations.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No allocations yet. Add one above.</div>
          )}
          {data.weeklyAllocations.map(alloc => {
            const asset = allAssets.find(a => a.symbol === alloc.symbol && a.type === alloc.assetType)
            const unitsPer = asset?.price && alloc.amount > 0 ? (alloc.amount / asset.price) : null
            return (
              <div key={alloc.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{alloc.symbol}</span>
                    <span className="badge badge-muted">{alloc.assetType}</span>
                    {unitsPer && <span style={{ fontSize: 11, color: 'var(--muted)' }}>≈ {fmtNum(unitsPer, 5)} units/wk</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={alloc.amount}
                      onChange={e => updateAlloc(alloc.id, parseInt(e.target.value) || 0)}
                      style={{ width: 80, padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--amber)', fontWeight: 700, textAlign: 'right', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif' }}
                    />
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>/wk</span>
                    <button className="icon-btn danger" onClick={() => updateData('weeklyAllocations', data.weeklyAllocations.filter(a => a.id !== alloc.id))}>✕</button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={alloc.amount}
                  onChange={e => updateAlloc(alloc.id, parseInt(e.target.value))}
                />
              </div>
            )
          })}
        </div>
      </div>

      {allocModal && (
        <AllocModal
          assets={allAssets}
          onClose={() => setAllocModal(false)}
          onSave={alloc => updateData('weeklyAllocations', [...data.weeklyAllocations, alloc])}
        />
      )}
    </div>
  )
}
