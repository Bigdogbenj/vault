import { useState, useMemo } from 'react'
import { BarChart, Bar, Cell, LineChart, Line, ReferenceLine, ReferenceDot, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt, fmtFull, fmtNative, fmtNum, pct, genId } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'
import { useSnapshots } from '../hooks/useSnapshots'

function Change({ val }) {
  if (val === null || val === undefined) return <span className="text-muted text-sm">—</span>
  return <span className={`text-sm ${val >= 0 ? 'text-green' : 'text-red'}`}>{pct(val)}</span>
}

function DollarChange({ val }) {
  if (val === null || val === undefined) return <span className="text-muted text-sm">—</span>
  const color = val >= 0 ? 'var(--green)' : 'var(--red)'
  const sign = val >= 0 ? '+' : ''
  return <span className="text-sm" style={{ color }}>{sign}{fmt(val)}</span>
}

function PriceCell({ aud }) {
  if (!aud) return <span className="text-muted">—</span>
  return <span>{fmtFull(aud)}</span>
}

function StockRow({ item, price, usdToAud, onEdit, onDelete, onEditVal }) {
  const aud = price?.aud ?? null
  const value = aud !== null ? item.shares * aud : null
  const costBasis = item.shares * item.avgCost * usdToAud
  const gainPct = costBasis > 0 && value !== null ? ((value - costBasis) / costBasis * 100) : null
  const gainDollar = value !== null && costBasis > 0 ? value - costBasis : null
  const change24hDollar = price?.change24h != null && value !== null ? (price.change24h / 100) * value : null
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{item.ticker}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.name}</div>
      </td>
      <td>
        <span className="editable-val" onClick={() => onEditVal(item, 'shares', 'Shares')}>{fmtNum(item.shares, 4)}</span>
      </td>
      <td>
        <span className="editable-val" onClick={() => onEditVal(item, 'avgCost', 'Avg Cost (USD)')}>
          {fmtFull(item.avgCost * usdToAud)}
        </span>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>US${item.avgCost?.toFixed(2)}</div>
      </td>
      <td><PriceCell aud={aud} /></td>
      <td>{value !== null ? <span className="editable-val" onClick={() => onEditVal(item, 'shares', 'Shares')}>{fmt(value)}</span> : <span className="text-muted">—</span>}</td>
      <td><Change val={gainPct} /></td>
      <td><DollarChange val={gainDollar} /></td>
      <td><Change val={price?.change24h} /></td>
      <td><DollarChange val={change24hDollar} /></td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={() => onEdit(item)} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={() => onDelete(item.id)} title="Delete">✕</button>
        </div>
      </td>
    </tr>
  )
}

function ETFRow({ item, price, usdToAud, onEdit, onDelete, onEditVal }) {
  const isUs = item.market === 'US'
  const aud = price?.aud ?? null
  const value = aud !== null ? item.units * aud : null
  const costBasis = item.units * (isUs ? item.avgCost * (usdToAud ?? 1.55) : item.avgCost)
  const gainPct = costBasis > 0 && value !== null ? ((value - costBasis) / costBasis * 100) : null
  const gainDollar = value !== null && costBasis > 0 ? value - costBasis : null
  const change24hDollar = price?.change24h != null && value !== null ? (price.change24h / 100) * value : null
  const avgCostLabel = `Avg Cost (${isUs ? 'USD' : 'AUD'})`
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{item.ticker}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.name}</div>
          </div>
          {isUs && <span className="badge badge-blue" style={{ fontSize: 10 }}>US</span>}
        </div>
      </td>
      <td><span className="editable-val" onClick={() => onEditVal(item, 'units', 'Units')}>{fmtNum(item.units, 2)}</span></td>
      <td><span className="editable-val" onClick={() => onEditVal(item, 'avgCost', avgCostLabel)}>{isUs ? fmtNative(item.avgCost, 'USD') : fmtFull(item.avgCost)}</span></td>
      <td><PriceCell aud={aud} /></td>
      <td>{value !== null ? fmt(value) : <span className="text-muted">—</span>}</td>
      <td><Change val={gainPct} /></td>
      <td><DollarChange val={gainDollar} /></td>
      <td><Change val={price?.change24h} /></td>
      <td><DollarChange val={change24hDollar} /></td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={() => onEdit(item)} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={() => onDelete(item.id)} title="Delete">✕</button>
        </div>
      </td>
    </tr>
  )
}

function CryptoRow({ item, price, onEdit, onDelete, onEditVal }) {
  const aud = price?.[item.coinId]?.aud ?? null
  const change24h = price?.[item.coinId]?.aud_24h_change ?? null
  const value = aud !== null ? item.amount * aud : null
  const costBasis = item.amount * item.avgCost
  const gainPct = costBasis > 0 && value !== null ? ((value - costBasis) / costBasis * 100) : null
  const gainDollar = value !== null && costBasis > 0 ? value - costBasis : null
  const change24hDollar = change24h != null && value !== null ? (change24h / 100) * value : null
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{item.symbol}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.name}</div>
      </td>
      <td><span className="editable-val" onClick={() => onEditVal(item, 'amount', 'Amount')}>{fmtNum(item.amount, 6)}</span></td>
      <td><span className="editable-val" onClick={() => onEditVal(item, 'avgCost', 'Avg Cost (AUD)')}>{fmtFull(item.avgCost)}</span></td>
      <td>{aud !== null ? <PriceCell aud={aud} /> : <span className="text-muted">—</span>}</td>
      <td>{value !== null ? fmt(value) : <span className="text-muted">—</span>}</td>
      <td><Change val={gainPct} /></td>
      <td><DollarChange val={gainDollar} /></td>
      <td><Change val={change24h} /></td>
      <td><DollarChange val={change24hDollar} /></td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={() => onEdit(item)} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={() => onDelete(item.id)} title="Delete">✕</button>
        </div>
      </td>
    </tr>
  )
}

function AssetTable({ headers, children, onAdd }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onAdd}>+ Add</button>
      </div>
      <div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

function StockModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { ticker: '', name: '', shares: 0, avgCost: 0 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal title={item ? 'Edit Stock' : 'Add Stock'} onClose={onClose}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Ticker</label>
          <input className="form-input" value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase())} placeholder="AMZN" />
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Amazon" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Shares</label>
          <input className="form-input" type="number" step="any" value={form.shares} onChange={e => set('shares', parseFloat(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">Avg Cost (USD)</label>
          <input className="form-input" type="number" step="any" value={form.avgCost} onChange={e => set('avgCost', parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function ETFModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { ticker: '', yahooTicker: '', name: '', units: 0, avgCost: 0, market: 'ASX', manualPriceAud: null })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleMarketChange = (market) => {
    setForm(f => ({
      ...f,
      market,
      yahooTicker: market === 'US' ? f.ticker : f.ticker + '.AX',
    }))
  }

  const handleTickerChange = (v) => {
    setForm(f => ({
      ...f,
      ticker: v,
      yahooTicker: f.market === 'US' ? v : v + '.AX',
    }))
  }

  const isUs = form.market === 'US'

  return (
    <Modal title={item ? 'Edit ETF' : 'Add ETF'} onClose={onClose}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Market</label>
          <select className="form-select" value={form.market || 'ASX'} onChange={e => handleMarketChange(e.target.value)}>
            <option value="ASX">ASX (VAS, VGS…)</option>
            <option value="US">US (TSLL, QQQ…)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ticker</label>
          <input className="form-input" value={form.ticker} onChange={e => handleTickerChange(e.target.value.toUpperCase())} placeholder={isUs ? 'TSLL' : 'VAS'} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={isUs ? 'Direxion Daily TSLA Bull 2X' : 'Vanguard Australian Shares'} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Units</label>
          <input className="form-input" type="number" step="any" min="0" value={form.units} onChange={e => set('units', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Avg Cost ({isUs ? 'USD' : 'AUD'})</label>
          <input className="form-input" type="number" step="any" min="0" value={form.avgCost} onChange={e => set('avgCost', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      {!isUs && (
        <div className="form-group">
          <label className="form-label">Manual Price AUD <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(fallback if live data unavailable)</span></label>
          <input className="form-input" type="number" step="any" min="0"
            value={form.manualPriceAud ?? ''}
            onChange={e => set('manualPriceAud', e.target.value === '' ? null : parseFloat(e.target.value))}
            placeholder="e.g. 96.50"
          />
        </div>
      )}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function CryptoModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { symbol: '', name: '', coinId: '', amount: 0, avgCost: 0 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal title={item ? 'Edit Crypto' : 'Add Crypto'} onClose={onClose}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Symbol</label>
          <input className="form-input" value={form.symbol} onChange={e => set('symbol', e.target.value.toUpperCase())} placeholder="BTC" />
        </div>
        <div className="form-group">
          <label className="form-label">CoinGecko ID</label>
          <input className="form-input" value={form.coinId} onChange={e => set('coinId', e.target.value.toLowerCase())} placeholder="bitcoin" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Bitcoin" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input className="form-input" type="number" step="any" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">Avg Cost (AUD)</label>
          <input className="form-input" type="number" step="any" value={form.avgCost} onChange={e => set('avgCost', parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function TransactionModal({ data, usdToAud, onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    date: today, type: 'buy', assetType: 'stocks',
    symbol: '', coinId: '', quantity: '', priceAud: '', notes: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAssetTypeChange = (assetType) => setForm(f => ({ ...f, assetType, symbol: '', coinId: '' }))
  const handleAssetChange = (value) => {
    if (form.assetType === 'crypto') {
      const coin = data.crypto.find(c => c.coinId === value)
      setForm(f => ({ ...f, coinId: value, symbol: coin?.symbol ?? '' }))
    } else {
      setForm(f => ({ ...f, symbol: value }))
    }
  }

  const assetOptions = form.assetType === 'crypto'
    ? data.crypto.filter(c => c.coinId).map(c => ({ value: c.coinId, label: `${c.symbol} — ${c.name}` }))
    : form.assetType === 'stocks'
    ? data.stocks.map(s => ({ value: s.ticker, label: `${s.ticker} — ${s.name}` }))
    : data.etfs.map(e => ({ value: e.ticker, label: `${e.ticker} — ${e.name}` }))

  const qtyLabel = form.assetType === 'crypto' ? 'Coins' : form.assetType === 'etfs' ? 'Units' : 'Shares'
  const qty = parseFloat(form.quantity) || 0
  const price = parseFloat(form.priceAud) || 0
  const total = qty * price
  const selectedAsset = form.assetType === 'crypto' ? form.coinId : form.symbol

  const handleSave = () => {
    if (!selectedAsset || qty <= 0 || price <= 0) return
    onSave({
      id: genId(), date: form.date, type: form.type, assetType: form.assetType,
      symbol: form.symbol, coinId: form.assetType === 'crypto' ? form.coinId : undefined,
      quantity: qty, priceAud: price, totalAud: total, notes: form.notes,
    })
    onClose()
  }

  return (
    <Modal title="Add Transaction" onClose={onClose}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn ${form.type === 'buy' ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ flex: 1 }} onClick={() => set('type', 'buy')}>Buy</button>
            <button className={`btn ${form.type === 'sell' ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ flex: 1 }} onClick={() => set('type', 'sell')}>Sell</button>
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Asset Type</label>
          <select className="form-select" value={form.assetType} onChange={e => handleAssetTypeChange(e.target.value)}>
            <option value="stocks">Stocks</option>
            <option value="etfs">ETFs</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Asset</label>
          <select className="form-select" value={selectedAsset} onChange={e => handleAssetChange(e.target.value)}>
            <option value="">Select…</option>
            {assetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{qtyLabel}</label>
          <input className="form-input" type="number" step="any" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Price per unit (AUD)</label>
          <input className="form-input" type="number" step="any" min="0" value={form.priceAud} onChange={e => set('priceAud', e.target.value)} placeholder="0.00" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Total (AUD)</label>
        <input className="form-input" value={total > 0 ? fmtFull(total) : '—'} readOnly style={{ color: 'var(--muted)', cursor: 'default' }} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
        <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. DCA purchase" />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={!selectedAsset || qty <= 0 || price <= 0}>Save</button>
      </div>
    </Modal>
  )
}

function getStageAmount(stages, month) {
  const year = Math.floor(month / 12)
  let amount = stages[0]?.amount ?? 0
  for (const stage of stages) {
    if (stage.fromYear <= year) amount = stage.amount
    else break
  }
  return amount
}

export function Portfolio({ data, updateData, prices }) {
  const [tab, setTab] = useState('stocks')
  const [modal, setModal] = useState(null)
  const [editVal, setEditVal] = useState(null)
  const [histRange, setHistRange] = useState('1M')
  const [addStage, setAddStage] = useState(null)

  const projSettings = data.projSettings ?? { years: 10, rate: { crypto: 15, etfs: 11, stocks: 15 }, monthly: { crypto: 200, etfs: 500, stocks: 300 } }
  const projYears = projSettings.years
  const projRate  = projSettings.rate
  const projStages = projSettings.projStages ?? {
    crypto: [{ fromYear: 0, amount: projSettings.monthly?.crypto ?? 200 }],
    etfs:   [{ fromYear: 0, amount: projSettings.monthly?.etfs   ?? 500 }],
    stocks: [{ fromYear: 0, amount: projSettings.monthly?.stocks ?? 300 }],
  }
  const setProjSettings = (patch) => updateData('projSettings', { ...projSettings, ...patch })
  const setProjYears  = (v) => setProjSettings({ years: v })
  const setProjRate   = (fn) => setProjSettings({ rate: typeof fn === 'function' ? fn(projRate) : fn })
  const setProjStages = (fn) => setProjSettings({ projStages: typeof fn === 'function' ? fn(projStages) : fn })

  const snapshots = useSnapshots()
  const usdToAud = prices?.usdToAud ?? 1.55

  const stockTotal = useMemo(() => data.stocks.reduce((s, st) => s + st.shares * (prices?.stocks?.[st.ticker]?.aud ?? 0), 0), [data.stocks, prices])
  const etfTotal = useMemo(() => data.etfs.reduce((s, e) => s + e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0), 0), [data.etfs, prices])
  const cryptoTotal = useMemo(() => data.crypto.reduce((s, c) => s + c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0), 0), [data.crypto, prices])

  const barData = [
    { name: 'Stocks', value: Math.round(stockTotal) },
    { name: 'ETFs', value: Math.round(etfTotal) },
    { name: 'Crypto', value: Math.round(cryptoTotal) },
  ]

  // Portfolio History: snapshots filtered by selected range
  const histTrend = useMemo(() => {
    if (!snapshots.length) return []
    const cutoffs = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (cutoffs[histRange] ?? 30))
    return snapshots
      .filter(s => new Date(s.date) >= cutoff)
      .map(s => ({
        label: new Date(s.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        crypto: s.crypto_value,
        stocks: s.stocks_value,
        etfs: s.etf_value,
      }))
  }, [snapshots, histRange])

  // Growth Projection: history + forward compound projection
  const { projChartData, projMilestones, projFinalValues } = useMemo(() => {
    const cryptoMonthlyRate = Math.pow(1 + projRate.crypto / 100, 1 / 12) - 1
    const etfMonthlyRate    = Math.pow(1 + projRate.etfs   / 100, 1 / 12) - 1
    const stockMonthlyRate  = Math.pow(1 + projRate.stocks / 100, 1 / 12) - 1
    const now = new Date()

    // Last 12 months of history for the combined chart
    const histCutoff = new Date(now)
    histCutoff.setMonth(histCutoff.getMonth() - 12)
    const hist = snapshots
      .filter(s => new Date(s.date) >= histCutoff)
      .map(s => ({
        label: new Date(s.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        crypto: s.crypto_value, stocks: s.stocks_value, etfs: s.etf_value,
      }))

    // Today bridge — carries both historical key names and projection key names
    const todayPt = {
      label: 'Today',
      crypto: cryptoTotal, stocks: stockTotal, etfs: etfTotal,
      projCrypto: cryptoTotal, projStocks: stockTotal, projEtfs: etfTotal,
    }

    // Build quarterly projection points + find milestones
    const TARGETS = [50000, 100000, 250000, 500000, 1000000, 2000000, 5000000]
    const trackers = [
      { projKey: 'projCrypto', color: '#f0a500', current: cryptoTotal, found: null },
      { projKey: 'projStocks', color: '#5b9ef0', current: stockTotal,  found: null },
      { projKey: 'projEtfs',   color: '#4caf7d', current: etfTotal,    found: null },
    ]
    let c = cryptoTotal, s = stockTotal, e = etfTotal
    const proj = []

    for (let m = 1; m <= projYears * 12; m++) {
      c = c * (1 + cryptoMonthlyRate) + getStageAmount(projStages.crypto, m)
      s = s * (1 + stockMonthlyRate)  + getStageAmount(projStages.stocks, m)
      e = e * (1 + etfMonthlyRate)    + getStageAmount(projStages.etfs,   m)

      if (m % 3 === 0) {
        const d = new Date(now)
        d.setMonth(d.getMonth() + m)
        const label = d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
        const vals = { projCrypto: Math.round(c), projStocks: Math.round(s), projEtfs: Math.round(e) }
        proj.push({ label, ...vals })

        // Milestone detection per asset (earliest unmet only)
        for (const t of trackers) {
          if (t.found) continue
          for (const target of TARGETS) {
            if (t.current >= target) continue   // already exceeded
            if (vals[t.projKey] >= target) {
              const labelStr = target >= 1_000_000
                ? `$${(target / 1_000_000).toFixed(target % 1_000_000 === 0 ? 0 : 1)}M`
                : `$${(target / 1000)}k`
              t.found = { x: label, y: target, color: t.color, projKey: t.projKey, labelStr }
              break
            }
          }
        }
      }
    }

    return {
      projChartData: [...hist, todayPt, ...proj],
      projMilestones: trackers.map(t => t.found).filter(Boolean),
      projFinalValues: { crypto: Math.round(c), stocks: Math.round(s), etfs: Math.round(e) },
    }
  }, [snapshots, cryptoTotal, stockTotal, etfTotal, projRate.crypto, projRate.etfs, projRate.stocks, projYears, projStages]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveTransaction = (tx) => {
    if (tx.assetType === 'crypto') {
      let found = false
      const updated = data.crypto.map(c => {
        if (c.coinId !== tx.coinId) return c
        found = true
        if (tx.type === 'buy') {
          const newAmount = c.amount + tx.quantity
          return { ...c, amount: newAmount, avgCost: (c.amount * c.avgCost + tx.quantity * tx.priceAud) / newAmount }
        }
        return { ...c, amount: Math.max(0, c.amount - tx.quantity) }
      })
      if (!found && tx.type === 'buy') updated.push({ id: genId(), symbol: tx.symbol, name: tx.symbol, coinId: tx.coinId, amount: tx.quantity, avgCost: tx.priceAud })
      updateData('crypto', updated)
    } else if (tx.assetType === 'stocks') {
      let found = false
      const updated = data.stocks.map(s => {
        if (s.ticker !== tx.symbol) return s
        found = true
        if (tx.type === 'buy') {
          const newShares = s.shares + tx.quantity
          const priceUsd = tx.priceAud / usdToAud
          return { ...s, shares: newShares, avgCost: (s.shares * s.avgCost + tx.quantity * priceUsd) / newShares }
        }
        return { ...s, shares: Math.max(0, s.shares - tx.quantity) }
      })
      if (!found && tx.type === 'buy') updated.push({ id: genId(), ticker: tx.symbol, name: tx.symbol, shares: tx.quantity, avgCost: tx.priceAud / usdToAud })
      updateData('stocks', updated)
    } else if (tx.assetType === 'etfs') {
      let found = false
      const updated = data.etfs.map(e => {
        if (e.ticker !== tx.symbol) return e
        found = true
        if (tx.type === 'buy') {
          const newUnits = e.units + tx.quantity
          return { ...e, units: newUnits, avgCost: (e.units * e.avgCost + tx.quantity * tx.priceAud) / newUnits }
        }
        return { ...e, units: Math.max(0, e.units - tx.quantity) }
      })
      if (!found && tx.type === 'buy') updated.push({ id: genId(), ticker: tx.symbol, yahooTicker: tx.symbol + '.AX', name: tx.symbol, units: tx.quantity, avgCost: tx.priceAud, market: 'ASX' })
      updateData('etfs', updated)
    }
    updateData('transactions', [tx, ...(data.transactions ?? [])])
  }

  const handleEditVal = (item, field, label) => setEditVal({ item, field, label })
  const saveEditVal = (list, key) => (v) => {
    updateData(key, list.map(x => x.id === editVal.item.id ? { ...x, [editVal.field]: parseFloat(v) } : x))
  }

  const TABLE_HEADERS = ['Asset', 'Holdings', 'Avg Cost', 'Price (AUD)', 'Value', 'Return %', 'Return $', '24h %', '24h $', 'Actions']

  return (
    <div className="page">
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Stocks</div>
          <div className="stat-value text-blue">{fmt(stockTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ETFs</div>
          <div className="stat-value text-green">{fmt(etfTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Crypto</div>
          <div className="stat-value text-amber">{fmt(cryptoTotal)}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title">Total Portfolio Value</div>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700 }}>{fmt(stockTotal + etfTotal + cryptoTotal)}</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={barData} layout="vertical">
            <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} width={50} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} labelStyle={{ color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} formatter={v => [fmt(v)]} />
            <Bar dataKey="value" radius={4}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={['#5b9ef0', '#4caf7d', '#f0a500'][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio History */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Portfolio History</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1W','1M','3M','6M','1Y'].map(r => (
              <button key={r} onClick={() => setHistRange(r)}
                className={`tab ${histRange === r ? 'active' : ''}`}
                style={{ marginBottom: 0, padding: '3px 8px', fontSize: 11 }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          {[{ label: 'Crypto', color: '#f0a500', value: cryptoTotal }, { label: 'Stocks', color: '#5b9ef0', value: stockTotal }, { label: 'ETFs', color: '#4caf7d', value: etfTotal }].map(({ label, color, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(value)}</span>
            </div>
          ))}
        </div>
        {histTrend.length < 2 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            Not enough data yet — history builds as you use the app 📈
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={histTrend}>
              <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v)]} labelStyle={{ color: 'var(--muted)' }} />
              <Line type="monotone" dataKey="crypto" stroke="#f0a500" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stocks" stroke="#5b9ef0" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="etfs"   stroke="#4caf7d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Growth Projection */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Growth Projection</span>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'crypto', label: 'Crypto',  color: '#f0a500' },
            { key: 'etfs',   label: 'ETFs',    color: '#4caf7d' },
            { key: 'stocks', label: 'Stocks',  color: '#5b9ef0' },
          ].map(({ key, label, color }) => (
            <div key={key} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12, paddingTop: 8, paddingBottom: 4, background: `${color}08`, borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{label} Monthly Contributions</div>
              {projStages[key].map((stage, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 68, flexShrink: 0 }}>From yr {stage.fromYear}:</span>
                  <input
                    className="form-input"
                    type="number" min="0"
                    style={{ width: 84, padding: '3px 8px', fontSize: 12 }}
                    value={stage.amount}
                    onChange={e => {
                      const updated = projStages[key].map((s, i) => i === idx ? { ...s, amount: parseFloat(e.target.value) || 0 } : s)
                      setProjStages(st => ({ ...st, [key]: updated }))
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>/mo</span>
                  {idx > 0 && (
                    <button className="icon-btn danger" style={{ padding: '2px 5px', fontSize: 11 }}
                      onClick={() => setProjStages(st => ({ ...st, [key]: st[key].filter((_, i) => i !== idx) }))}>✕</button>
                  )}
                </div>
              ))}
              {addStage?.key === key ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>From yr:</span>
                  <input className="form-input" type="number" min="1"
                    style={{ width: 52, padding: '3px 8px', fontSize: 12 }}
                    value={addStage.fromYear}
                    onChange={e => setAddStage(s => ({ ...s, fromYear: e.target.value }))} />
                  <input className="form-input" type="number" min="0"
                    style={{ width: 80, padding: '3px 8px', fontSize: 12 }}
                    value={addStage.amount}
                    placeholder="$/mo"
                    onChange={e => setAddStage(s => ({ ...s, amount: e.target.value }))} />
                  <button className="btn btn-sm btn-primary" style={{ padding: '3px 10px', fontSize: 11 }}
                    onClick={() => {
                      const fy = parseInt(addStage.fromYear)
                      const amt = parseFloat(addStage.amount) || 0
                      if (!fy || fy < 1) return
                      const updated = [...projStages[key], { fromYear: fy, amount: amt }]
                        .sort((a, b) => a.fromYear - b.fromYear)
                      setProjStages(st => ({ ...st, [key]: updated }))
                      setAddStage(null)
                    }}>Save</button>
                  <button className="btn btn-sm btn-ghost" style={{ padding: '3px 10px', fontSize: 11 }}
                    onClick={() => setAddStage(null)}>Cancel</button>
                </div>
              ) : (
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 2, fontSize: 11, padding: '2px 8px' }}
                  onClick={() => setAddStage({ key, fromYear: '', amount: '' })}>+ Add stage</button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label className="form-label">Time horizon: <strong>{projYears} year{projYears !== 1 ? 's' : ''}</strong></label>
            <input type="range" min="1" max="50" value={projYears} onChange={e => setProjYears(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--amber)', cursor: 'pointer', marginTop: 6 }} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Crypto Annual Growth (%)</label>
            <input className="form-input" type="number" min="0" max="200" step="0.5" value={projRate.crypto}
              onChange={e => setProjRate(r => ({ ...r, crypto: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">ETFs Annual Growth (%)</label>
            <input className="form-input" type="number" min="0" max="100" step="0.5" value={projRate.etfs}
              onChange={e => setProjRate(r => ({ ...r, etfs: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Stocks Annual Growth (%)</label>
            <input className="form-input" type="number" min="0" max="100" step="0.5" value={projRate.stocks}
              onChange={e => setProjRate(r => ({ ...r, stocks: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={projChartData}>
            <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v, name) => v != null ? [fmt(v), name] : null} labelStyle={{ color: 'var(--muted)' }} />
            <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: 'var(--muted)', paddingTop: 8 }} />
            {/* Solid historical lines */}
            <Line type="monotone" dataKey="crypto" name="Crypto (actual)" stroke="#f0a500" strokeWidth={2} dot={false} connectNulls={false} legendType="none" />
            <Line type="monotone" dataKey="stocks" name="Stocks (actual)" stroke="#5b9ef0" strokeWidth={2} dot={false} connectNulls={false} legendType="none" />
            <Line type="monotone" dataKey="etfs"   name="ETFs (actual)"   stroke="#4caf7d" strokeWidth={2} dot={false} connectNulls={false} legendType="none" />
            {/* Dashed projection lines */}
            <Line type="monotone" dataKey="projCrypto" name="Crypto (projected)" stroke="#f0a500" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="projStocks" name="Stocks (projected)" stroke="#5b9ef0" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="projEtfs"   name="ETFs (projected)"   stroke="#4caf7d" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            {/* Today marker */}
            <ReferenceLine x="Today" stroke="var(--muted)" strokeDasharray="3 3" label={{ value: 'Today', position: 'top', fill: 'var(--muted)', fontSize: 10 }} />
            {/* Milestone dots */}
            {projMilestones.map((m, i) => (
              <ReferenceDot key={i} x={m.x} y={m.y} r={5} fill={m.color} stroke="var(--surface)" strokeWidth={2}
                label={{ value: m.labelStr, position: 'top', fill: m.color, fontSize: 10, fontWeight: 700 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Final value cards */}
        <div className="grid-3" style={{ marginTop: 16 }}>
          {[
            { label: 'Crypto', color: '#f0a500', key: 'crypto', today: cryptoTotal },
            { label: 'ETFs',   color: '#4caf7d', key: 'etfs',   today: etfTotal   },
            { label: 'Stocks', color: '#5b9ef0', key: 'stocks', today: stockTotal  },
          ].map(({ label, color, key, today }) => (
            <div key={key} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label} in {projYears}y</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color }}>{fmt(projFinalValues[key])}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmt(today)} today</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          {['stocks', 'etfs', 'crypto', 'transactions'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'etfs' ? 'ETFs' : t === 'transactions' ? 'Transactions' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'stocks' && (
          <AssetTable headers={TABLE_HEADERS} onAdd={() => setModal({ type: 'stock', item: null })}>
            {data.stocks.map(s => (
              <StockRow key={s.id} item={s} price={prices?.stocks?.[s.ticker]} usdToAud={usdToAud}
                onEdit={item => setModal({ type: 'stock', item })}
                onDelete={id => updateData('stocks', data.stocks.filter(x => x.id !== id))}
                onEditVal={handleEditVal}
              />
            ))}
          </AssetTable>
        )}

        {tab === 'etfs' && (
          <AssetTable headers={TABLE_HEADERS} onAdd={() => setModal({ type: 'etf', item: null })}>
            {data.etfs.map(e => (
              <ETFRow key={e.id} item={e} price={prices?.etfs?.[e.ticker]} usdToAud={usdToAud}
                onEdit={item => setModal({ type: 'etf', item })}
                onDelete={id => updateData('etfs', data.etfs.filter(x => x.id !== id))}
                onEditVal={handleEditVal}
              />
            ))}
          </AssetTable>
        )}

        {tab === 'crypto' && (
          <AssetTable headers={TABLE_HEADERS} onAdd={() => setModal({ type: 'crypto', item: null })}>
            {data.crypto.map(c => (
              <CryptoRow key={c.id} item={c} price={prices?.crypto}
                onEdit={item => setModal({ type: 'crypto', item })}
                onDelete={id => updateData('crypto', data.crypto.filter(x => x.id !== id))}
                onEditVal={handleEditVal}
              />
            ))}
          </AssetTable>
        )}

        {tab === 'transactions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'transaction' })}>+ Add Transaction</button>
            </div>
            {(data.transactions ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
                No transactions yet — log your first buy or sell above
              </div>
            ) : (
              <div>
                {['crypto', 'stocks', 'etfs'].map(group => {
                  const txs = (data.transactions ?? [])
                    .filter(t => t.assetType === group)
                    .sort((a, b) => b.date.localeCompare(a.date))
                  if (txs.length === 0) return null
                  return (
                    <div key={group} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 0 8px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                        {group === 'etfs' ? 'ETFs' : group.charAt(0).toUpperCase() + group.slice(1)}
                      </div>
                      <div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th><th>Type</th><th>Asset</th><th>Quantity</th>
                              <th>Price (AUD)</th><th>Total (AUD)</th><th>Notes</th><th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {txs.map(tx => (
                              <tr key={tx.id}>
                                <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: 13 }}>{tx.date}</td>
                                <td><span className={`badge ${tx.type === 'buy' ? 'badge-green' : 'badge-red'}`}>{tx.type === 'buy' ? 'Buy' : 'Sell'}</span></td>
                                <td style={{ fontWeight: 600 }}>{tx.symbol}</td>
                                <td>{fmtNum(tx.quantity, 6)}</td>
                                <td>{fmtFull(tx.priceAud)}</td>
                                <td>{fmt(tx.totalAud)}</td>
                                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{tx.notes || '—'}</td>
                                <td>
                                  <button className="icon-btn danger"
                                    onClick={() => updateData('transactions', (data.transactions ?? []).filter(t => t.id !== tx.id))}
                                    title="Delete">✕</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {modal?.type === 'stock' && (
        <StockModal item={modal.item} onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) updateData('stocks', data.stocks.map(s => s.id === modal.item.id ? { ...s, ...form } : s))
            else updateData('stocks', [...data.stocks, { ...form, id: genId() }])
          }}
        />
      )}

      {modal?.type === 'etf' && (
        <ETFModal item={modal.item} onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) updateData('etfs', data.etfs.map(e => e.id === modal.item.id ? { ...e, ...form } : e))
            else updateData('etfs', [...data.etfs, { ...form, id: genId() }])
          }}
        />
      )}

      {modal?.type === 'crypto' && (
        <CryptoModal item={modal.item} onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) updateData('crypto', data.crypto.map(c => c.id === modal.item.id ? { ...c, ...form } : c))
            else updateData('crypto', [...data.crypto, { ...form, id: genId() }])
          }}
        />
      )}

      {modal?.type === 'transaction' && (
        <TransactionModal data={data} usdToAud={usdToAud} onClose={() => setModal(null)} onSave={saveTransaction} />
      )}

      {editVal && (
        <EditValueModal
          label={editVal.label}
          value={editVal.item[editVal.field]}
          onClose={() => setEditVal(null)}
          onSave={tab === 'stocks' ? saveEditVal(data.stocks, 'stocks') : tab === 'etfs' ? saveEditVal(data.etfs, 'etfs') : saveEditVal(data.crypto, 'crypto')}
        />
      )}
    </div>
  )
}
