import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt, fmtFull, fmtNative, fmtNum, pct, genId } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'

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

export function Portfolio({ data, updateData, prices }) {
  const [tab, setTab] = useState('stocks')
  const [modal, setModal] = useState(null)
  const [editVal, setEditVal] = useState(null)

  const usdToAud = prices?.usdToAud ?? 1.55

  const stockTotal = useMemo(() => data.stocks.reduce((s, st) => s + st.shares * (prices?.stocks?.[st.ticker]?.aud ?? 0), 0), [data.stocks, prices])
  const etfTotal = useMemo(() => data.etfs.reduce((s, e) => s + e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0), 0), [data.etfs, prices])
  const cryptoTotal = useMemo(() => data.crypto.reduce((s, c) => s + c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0), 0), [data.crypto, prices])

  const barData = [
    { name: 'Stocks', value: Math.round(stockTotal) },
    { name: 'ETFs', value: Math.round(etfTotal) },
    { name: 'Crypto', value: Math.round(cryptoTotal) },
  ]

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
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v)]} />
            <Bar dataKey="value" radius={4} fill="#5b9ef0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="tabs">
          {['stocks', 'etfs', 'crypto'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'etfs' ? 'ETFs' : t.charAt(0).toUpperCase() + t.slice(1)}
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
