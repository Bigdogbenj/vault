import { useState, useMemo } from 'react'
import { fmt, fmtNum, genId, getNextFireTime, toMonthly } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'
import { DEFAULTS } from '../data/defaults'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FREQ_LABELS = { once: 'Once', weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Quarterly' }

const POOL_CONFIG = {
  crypto: { label: 'Crypto Pool', color: '#a87ef0', icon: '🔮' },
  stocks: { label: 'Stocks Pool', color: '#4caf7d', icon: '📈' },
  etfs:   { label: 'ETF Pool',    color: '#5b9ef0', icon: '🏦' },
}

const TYPE_CONFIG = {
  income:   { color: '#4caf7d', bg: 'rgba(76,175,125,0.12)',  border: '#4caf7d', label: 'Income'   },
  transfer: { color: '#5b9ef0', bg: 'rgba(91,158,240,0.12)',  border: '#5b9ef0', label: 'Transfer' },
  expense:  { color: '#e05b5b', bg: 'rgba(224,91,91,0.12)',   border: '#e05b5b', label: 'Expense'  },
}

const SECTIONS = [
  { type: 'income',   label: 'Income',             emptyText: 'No income schedules set up' },
  { type: 'transfer', label: 'Internal Transfers',  emptyText: 'No transfer schedules set up' },
  { type: 'expense',  label: 'Expenses',            emptyText: 'No expense schedules set up' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFireTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  if (diff < 0) return 'Overdue'
  const days = Math.floor(diff / (24 * 3600 * 1000))
  if (days === 0) return `Today ${time}`
  if (days === 1) return `Tomorrow ${time}`
  if (days < 7) return `${DAYS[d.getDay()]} ${time}`
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) + ` ${time}`
}

function fmtLogDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

function scheduleSubtitle(s, accounts) {
  if (s.type === 'income') {
    const toName = accounts.find(a => a.id === s.toAccount)?.name ?? '—'
    return `${s.sourceLabel || 'Income'} → ${toName}`
  }
  if (s.type === 'expense') {
    const fromName = accounts.find(a => a.id === s.fromAccount)?.name ?? '—'
    return `${fromName} → Expense`
  }
  const fromName = accounts.find(a => a.id === s.fromAccount)?.name ?? '—'
  const toName = s.toPool
    ? POOL_CONFIG[s.toPool]?.label
    : (accounts.find(a => a.id === s.toAccount)?.name ?? '—')
  return `${fromName} → ${toName}`
}

function freqLabel(s) {
  const f = FREQ_LABELS[s.frequency] ?? s.frequency
  if (s.frequency === 'weekly' || s.frequency === 'fortnightly') return `${f} · ${DAYS[s.dayOfWeek]} ${String(s.hour).padStart(2,'0')}:${String(s.minute).padStart(2,'0')}`
  if (s.frequency === 'monthly' || s.frequency === 'quarterly') return `${f} · ${s.dayOfMonth}${['st','nd','rd'][((s.dayOfMonth-1)%3)] ?? 'th'} ${String(s.hour).padStart(2,'0')}:${String(s.minute).padStart(2,'0')}`
  return f
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
      background: checked ? '#4caf7d' : '#6b7280', position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 18 : 2, transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ─── Schedule Card ────────────────────────────────────────────────────────────

function ScheduleCard({ schedule: s, accounts, onEdit, onDelete, onToggle }) {
  const nextFire = useMemo(() => s.active ? getNextFireTime(s, new Date()) : null, [s])
  const tc = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.transfer

  return (
    <div className="card" style={{ padding: '16px 18px', borderLeft: `3px solid ${tc.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>{s.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: tc.bg, color: tc.color, flexShrink: 0 }}>
              {tc.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{scheduleSubtitle(s, accounts)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{freqLabel(s)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <Toggle checked={s.active} onChange={onToggle} />
          <button className="icon-btn" onClick={onEdit} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Amount</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: tc.color }}>{fmt(s.amount)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
            {s.active ? 'Next Due' : 'Paused'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: s.active ? 'var(--amber)' : 'var(--muted)' }}>
            {s.active ? fmtFireTime(nextFire) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0]

function ScheduleModal({ item, accounts, onClose, onSave }) {
  const initToType = item?.toPool ? 'pool' : 'account'
  const [toType, setToType] = useState(initToType)
  const [form, setForm] = useState(item ? { ...item } : {
    name: '', type: 'income', amount: 0,
    sourceLabel: '', fromAccount: '', toAccount: accounts[0]?.id ?? '', toPool: '',
    frequency: 'fortnightly', dayOfWeek: 3, dayOfMonth: 1,
    hour: 9, minute: 0, startDate: TODAY, active: true, lastFiredAt: null,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const saved = { ...form }
    if (toType === 'pool') { saved.toAccount = null } else { saved.toPool = null }
    if (saved.type === 'income') { saved.fromAccount = null }
    if (saved.type === 'expense') { saved.toAccount = null; saved.toPool = null }
    onSave(saved)
    onClose()
  }

  const showDayOfWeek = form.frequency === 'weekly' || form.frequency === 'fortnightly'
  const showDayOfMonth = form.frequency === 'monthly' || form.frequency === 'quarterly'
  const timeVal = `${String(form.hour).padStart(2,'0')}:${String(form.minute).padStart(2,'0')}`

  return (
    <Modal title={item ? 'Edit Schedule' : 'Add Schedule'} onClose={onClose} size="modal-lg">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Fortnightly Pay" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input className="form-input" type="number" step="1" min="0" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select className="form-select" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
            {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {showDayOfWeek && (
        <div className="form-group">
          <label className="form-label">Day of Week</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS.map((d, i) => (
              <button key={i} onClick={() => set('dayOfWeek', i)} style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${form.dayOfWeek === i ? 'var(--amber)' : 'var(--border)'}`,
                background: form.dayOfWeek === i ? 'rgba(240,165,0,0.12)' : 'transparent',
                color: form.dayOfWeek === i ? 'var(--amber)' : 'var(--muted)',
              }}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {showDayOfMonth && (
        <div className="form-group">
          <label className="form-label">Day of Month</label>
          <input className="form-input" type="number" min="1" max="28" value={form.dayOfMonth} onChange={e => set('dayOfMonth', parseInt(e.target.value) || 1)} />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" value={timeVal} onChange={e => {
            const [h, m] = e.target.value.split(':')
            set('hour', parseInt(h) || 0)
            set('minute', parseInt(m) || 0)
          }} />
        </div>
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>
      </div>

      {form.type === 'income' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Source Label</label>
            <input className="form-input" value={form.sourceLabel ?? ''} onChange={e => set('sourceLabel', e.target.value)} placeholder="Employer" />
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Into Account</label>
            <select className="form-select" value={form.toAccount ?? ''} onChange={e => set('toAccount', e.target.value)}>
              <option value="">— select —</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {form.type === 'expense' && (
        <div className="form-group">
          <label className="form-label">Deduct From</label>
          <select className="form-select" value={form.fromAccount ?? ''} onChange={e => set('fromAccount', e.target.value)}>
            <option value="">— select —</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      )}

      {form.type === 'transfer' && (
        <>
          <div className="form-group">
            <label className="form-label">From Account</label>
            <select className="form-select" value={form.fromAccount ?? ''} onChange={e => set('fromAccount', e.target.value)}>
              <option value="">— select —</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Send To</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {['account', 'pool'].map(t => (
                <button key={t} onClick={() => setToType(t)} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${toType === t ? 'var(--amber)' : 'var(--border)'}`,
                  background: toType === t ? 'rgba(240,165,0,0.12)' : 'transparent',
                  color: toType === t ? 'var(--amber)' : 'var(--muted)',
                }}>{t === 'account' ? 'Account' : 'Investment Pool'}</button>
              ))}
            </div>
            {toType === 'account' ? (
              <select className="form-select" value={form.toAccount ?? ''} onChange={e => set('toAccount', e.target.value)}>
                <option value="">— select —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            ) : (
              <select className="form-select" value={form.toPool ?? ''} onChange={e => set('toPool', e.target.value)}>
                <option value="">— select —</option>
                {Object.entries(POOL_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            )}
          </div>
        </>
      )}

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Toggle checked={form.active} onChange={() => set('active', !form.active)} />
        <span style={{ fontSize: 13, color: form.active ? 'var(--green)' : 'var(--muted)' }}>
          {form.active ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

// ─── Pool Card ────────────────────────────────────────────────────────────────

function PoolCard({ poolId, pool, onDeploy, onEditContrib, onEditAvailable }) {
  const cfg = POOL_CONFIG[poolId]
  return (
    <div className="card" style={{ borderTop: `2px solid ${cfg.color}`, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, fontSize: 20,
            background: `${cfg.color}15`, border: `1.5px solid ${cfg.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{cfg.icon}</div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>{cfg.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, cursor: 'pointer' }} onClick={onEditContrib}>
              {fmt(pool.weeklyContribution)}/week <span style={{ color: 'var(--amber)' }}>✎</span>
            </div>
          </div>
        </div>
        <button className="btn btn-sm" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }} onClick={onDeploy}>
          Deploy →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Available</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: cfg.color, cursor: 'pointer' }} onClick={onEditAvailable}>
            {fmt(pool.available)} <span style={{ color: 'var(--amber)', fontSize: 13 }}>✎</span>
          </div>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Deployed</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18 }}>{fmt(pool.deployedTotal)}</div>
        </div>
      </div>
      {pool.lastDeployedAt && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          Last deployed {fmt(pool.lastDeployedAmount ?? 0)} on {new Date(pool.lastDeployedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}

// ─── Deploy Modal ─────────────────────────────────────────────────────────────

function DeployModal({ poolId, pool, data, prices, onClose, onDeploy }) {
  const cfg = POOL_CONFIG[poolId]

  const getLivePrice = (assetValue) => {
    if (!prices || !assetValue) return 0
    if (poolId === 'crypto') {
      const coin = data.crypto.find(c => c.symbol === assetValue)
      return coin ? (prices.crypto?.[coin.coinId]?.aud ?? 0) : 0
    }
    if (poolId === 'stocks') return prices.stocks?.[assetValue]?.usd ?? 0
    const etf = data.etfs.find(e => e.ticker === assetValue)
    return etf?.market === 'US'
      ? (prices.etfs?.[assetValue]?.usd ?? 0)
      : (prices.etfs?.[assetValue]?.aud ?? 0)
  }

  const assetList = poolId === 'crypto' ? data.crypto.map(c => c.symbol)
                  : poolId === 'stocks' ? data.stocks.map(s => s.ticker)
                  : data.etfs.map(e => e.ticker)

  const initialAsset = assetList[0] ?? ''
  const [asset, setAsset] = useState(initialAsset)
  const [units, setUnits] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState(() => {
    const p = getLivePrice(initialAsset)
    return p ? String(p) : ''
  })
  const [date, setDate] = useState(TODAY)

  const handleAssetChange = (val) => {
    setAsset(val)
    const livePrice = getLivePrice(val)
    if (livePrice) setPricePerUnit(String(livePrice))
  }

  const unitsNum = parseFloat(units) || 0
  const priceNum = parseFloat(pricePerUnit) || 0
  const totalCost = unitsNum * priceNum

  const isUsdAsset = poolId === 'stocks' ||
    (poolId === 'etfs' && data.etfs.find(e => e.ticker === asset)?.market === 'US')
  const priceLabel = isUsdAsset ? 'Price per Unit (USD)' : 'Price per Unit (AUD)'

  const handleConfirm = () => {
    if (unitsNum <= 0 || priceNum <= 0 || !asset) return
    onDeploy({
      poolId,
      asset,
      units: unitsNum,
      pricePerUnit: priceNum,
      amount: totalCost,
      deployedAt: new Date(date + 'T12:00:00').toISOString(),
    })
    onClose()
  }

  return (
    <Modal title={`Deploy from ${cfg.label}`} onClose={onClose} size="modal-sm">
      <div style={{ borderTop: `2px solid ${cfg.color}`, marginBottom: 20, paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Available to deploy</span>
          <span style={{ fontWeight: 700, color: cfg.color }}>{fmt(pool.available)}</span>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Asset</label>
        <select className="form-select" value={asset} onChange={e => handleAssetChange(e.target.value)}>
          {assetList.length === 0
            ? <option value="">No assets in portfolio</option>
            : assetList.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Number of Units</label>
          <input className="form-input" type="number" step="any" min="0"
            value={units} onChange={e => setUnits(e.target.value)} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">{priceLabel}</label>
          <input className="form-input" type="number" step="any" min="0"
            value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} placeholder="0.00" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Date</label>
        <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total Cost</span>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 20, color: cfg.color }}>{fmt(totalCost)}</span>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleConfirm}
          style={{ background: cfg.color, opacity: totalCost > 0 ? 1 : 0.5 }}>
          Confirm Deploy
        </button>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Schedules({ data, updateData, prices }) {
  const [tab, setTab] = useState('schedules')
  const [modal, setModal] = useState(null)
  const [deployModal, setDeployModal] = useState(null)
  const [editContrib, setEditContrib] = useState(null)

  const schedules = data.schedules ?? []
  const pools = data.pools ?? DEFAULTS.pools
  const transferLog = data.transferLog ?? []
  const poolDeployments = data.poolDeployments ?? []
  const accounts = data.accounts ?? []

  const saveSchedule = (form) => {
    if (modal?.item) {
      updateData('schedules', schedules.map(s => s.id === modal.item.id ? { ...s, ...form } : s))
    } else {
      updateData('schedules', [...schedules, { ...form, id: genId(), lastFiredAt: new Date().toISOString() }])
    }
  }

  const deleteSchedule = (id) => updateData('schedules', schedules.filter(s => s.id !== id))
  const toggleSchedule = (id) => updateData('schedules', schedules.map(s => s.id === id ? { ...s, active: !s.active } : s))

  const handleDeleteDeployment = (id) => {
    const entry = poolDeployments.find(d => d.id === id)
    if (!entry) return
    updateData('pools', {
      ...pools,
      [entry.poolId]: {
        ...pools[entry.poolId],
        available: (pools[entry.poolId]?.available || 0) + entry.amount,
        deployedTotal: Math.max(0, (pools[entry.poolId]?.deployedTotal || 0) - entry.amount),
      },
    })
    updateData('poolDeployments', poolDeployments.filter(d => d.id !== id))
  }

  const handleDeploy = ({ poolId, asset, units, pricePerUnit, amount, deployedAt }) => {
    const newDeployment = { id: genId(), poolId, asset, units, pricePerUnit, amount, deployedAt }

    updateData('pools', {
      ...pools,
      [poolId]: {
        ...pools[poolId],
        available: Math.max(0, (pools[poolId].available || 0) - amount),
        deployedTotal: (pools[poolId].deployedTotal || 0) + amount,
        lastDeployedAt: deployedAt,
        lastDeployedAmount: amount,
      },
    })

    if (poolId === 'crypto') {
      updateData('crypto', data.crypto.map(c => {
        if (c.symbol !== asset) return c
        const oldQty = c.amount || 0
        const newQty = oldQty + units
        const avgCost = newQty > 0 ? (oldQty * (c.avgCost || 0) + units * pricePerUnit) / newQty : pricePerUnit
        return { ...c, amount: newQty, avgCost }
      }))
    } else if (poolId === 'stocks') {
      updateData('stocks', data.stocks.map(s => {
        if (s.ticker !== asset) return s
        const oldShares = s.shares || 0
        const newShares = oldShares + units
        const avgCost = newShares > 0 ? (oldShares * (s.avgCost || 0) + units * pricePerUnit) / newShares : pricePerUnit
        return { ...s, shares: newShares, avgCost }
      }))
    } else {
      updateData('etfs', data.etfs.map(e => {
        if (e.ticker !== asset) return e
        const oldUnits = e.units || 0
        const newUnits = oldUnits + units
        const avgCost = newUnits > 0 ? (oldUnits * (e.avgCost || 0) + units * pricePerUnit) / newUnits : pricePerUnit
        return { ...e, units: newUnits, avgCost }
      }))
    }

    updateData('poolDeployments', [newDeployment, ...poolDeployments])
  }

  // ── Transfer Summary stats ────────────────────────────────────────────────
  const { transferGroups, expenseGroups, totalTransferred, totalExpensesPaid, maxTransfer, maxExpense } = useMemo(() => {
    const tMap = {}, eMap = {}
    let totalT = 0, totalE = 0
    for (const entry of transferLog) {
      if (entry.type === 'transfer') {
        tMap[entry.scheduleName] = tMap[entry.scheduleName] ?? { name: entry.scheduleName, total: 0, count: 0 }
        tMap[entry.scheduleName].total += entry.amount
        tMap[entry.scheduleName].count++
        totalT += entry.amount
      } else if (entry.type === 'expense') {
        eMap[entry.scheduleName] = eMap[entry.scheduleName] ?? { name: entry.scheduleName, total: 0, count: 0 }
        eMap[entry.scheduleName].total += entry.amount
        eMap[entry.scheduleName].count++
        totalE += entry.amount
      }
    }
    const tGroups = Object.values(tMap).sort((a, b) => b.total - a.total)
    const eGroups = Object.values(eMap).sort((a, b) => b.total - a.total)
    return {
      transferGroups: tGroups,
      expenseGroups: eGroups,
      totalTransferred: totalT,
      totalExpensesPaid: totalE,
      maxTransfer: tGroups[0]?.total ?? 1,
      maxExpense: eGroups[0]?.total ?? 1,
    }
  }, [transferLog])

  // ── Accumulated chart data ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (transferLog.length < 2) return []
    const byMonth = {}
    for (const entry of transferLog) {
      const d = new Date(entry.firedAt)
      const key = `${d.toLocaleString('en-AU', { month: 'short' })} ${d.getFullYear()}`
      byMonth[key] = byMonth[key] ?? { transfers: 0, expenses: 0, ts: d.getTime() }
      if (entry.type === 'transfer') byMonth[key].transfers += entry.amount
      if (entry.type === 'expense') byMonth[key].expenses += entry.amount
    }
    let cumT = 0, cumE = 0
    return Object.entries(byMonth)
      .sort(([, a], [, b]) => a.ts - b.ts)
      .map(([month, { transfers, expenses }]) => {
        cumT += transfers
        cumE += expenses
        return { month, transfers: Math.round(cumT), expenses: Math.round(cumE) }
      })
  }, [transferLog])

  const activeCount = schedules.filter(s => s.active).length

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Schedules</div>
          <div className="page-subtitle">{activeCount} active · automated transfers &amp; investment pools</div>
        </div>
        {tab === 'schedules' && (
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}>+ Add Schedule</button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['schedules', 'Schedules'], ['pools', 'Investment Pools']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── Schedules tab ─────────────────────────────────────────── */}
      {tab === 'schedules' && (
        <>
          {/* Grouped sections */}
          {SECTIONS.map(({ type, label, emptyText }) => {
            const tc = TYPE_CONFIG[type]
            const group = schedules.filter(s => s.type === type)
            const monthlyTotal = group.filter(s => s.active).reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0)
            return (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: tc.border }} />
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15 }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', padding: '1px 8px', borderRadius: 20 }}>{group.length}</span>
                  </div>
                  {monthlyTotal > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(monthlyTotal)}/mo active</span>
                  )}
                </div>
                {group.length === 0 ? (
                  <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
                    {emptyText}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
                    {group.map(s => (
                      <ScheduleCard key={s.id} schedule={s} accounts={accounts}
                        onEdit={() => setModal({ item: s })}
                        onDelete={() => deleteSchedule(s.id)}
                        onToggle={() => toggleSchedule(s.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Transfer Summary */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Transfer Summary</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Transfers column */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Transfers</div>
                {transferGroups.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>No transfers logged yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {transferGroups.map(g => (
                      <div key={g.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{g.count}× · {fmt(g.total)}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(g.total / maxTransfer) * 100}%`, background: '#5b9ef0' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Expenses column */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Expenses</div>
                {expenseGroups.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>No expenses logged yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {expenseGroups.map(g => (
                      <div key={g.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{g.count}× · {fmt(g.total)}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(g.total / maxExpense) * 100}%`, background: '#e05b5b' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13 }}>
                Total invested via transfers: <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{fmt(totalTransferred)}</span>
              </div>
              <div style={{ fontSize: 13 }}>
                Total expenses paid: <span style={{ fontWeight: 700, color: '#e05b5b' }}>{fmt(totalExpensesPaid)}</span>
              </div>
            </div>
          </div>

          {/* Accumulated Transfers chart */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Accumulated Transfers Over Time</span>
            </div>
            {chartData.length < 2 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
                Not enough data yet — history builds as schedules fire
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                  {[{ label: 'Transfers', color: '#5b9ef0' }, { label: 'Expenses', color: '#e05b5b' }].map(({ label, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 3, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b9ef0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#5b9ef0" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e05b5b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e05b5b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                      formatter={(v, name) => [fmt(v), name === 'transfers' ? 'Transfers' : 'Expenses']}
                      labelStyle={{ color: 'var(--muted)' }}
                    />
                    <Area type="monotone" dataKey="transfers" stroke="#5b9ef0" strokeWidth={2} fill="url(#gradT)" dot={false} />
                    <Area type="monotone" dataKey="expenses"  stroke="#e05b5b" strokeWidth={2} fill="url(#gradE)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Transfer History */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Transfer History</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{transferLog.length} entries</span>
            </div>
            {transferLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>No transfers have fired yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Schedule</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferLog.map(entry => {
                      const tc = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.transfer
                      return (
                        <tr key={entry.id}>
                          <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtLogDate(entry.firedAt)}</td>
                          <td style={{ fontWeight: 600 }}>{entry.scheduleName}</td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: tc.bg, color: tc.color }}>{tc.label}</span></td>
                          <td style={{ color: 'var(--muted)', fontSize: 13 }}>{entry.fromLabel}</td>
                          <td style={{ color: 'var(--muted)', fontSize: 13 }}>{entry.toLabel}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: entry.type === 'income' ? 'var(--green)' : entry.type === 'expense' ? '#e05b5b' : 'var(--text)', whiteSpace: 'nowrap' }}>
                            {entry.type === 'income' ? '+' : entry.type === 'expense' ? '-' : ''}{fmt(entry.amount)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Investment Pools tab ───────────────────────────────────── */}
      {tab === 'pools' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Object.entries(pools).map(([id, pool]) => (
              <PoolCard key={id} poolId={id} pool={pool}
                onDeploy={() => setDeployModal(id)}
                onEditContrib={() => setEditContrib({ poolId: id, field: 'weeklyContribution', label: `${POOL_CONFIG[id].label} Weekly Contribution` })}
                onEditAvailable={() => setEditContrib({ poolId: id, field: 'available', label: `${POOL_CONFIG[id].label} Available Balance` })}
              />
            ))}
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">Deployment History</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{poolDeployments.length} entries</span>
            </div>
            {poolDeployments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>No deployments yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pool</th>
                      <th>Asset</th>
                      <th style={{ textAlign: 'right' }}>Units</th>
                      <th style={{ textAlign: 'right' }}>Price/Unit</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {poolDeployments.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          {new Date(d.deployedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${POOL_CONFIG[d.poolId]?.color}18`, color: POOL_CONFIG[d.poolId]?.color }}>
                            {POOL_CONFIG[d.poolId]?.label}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{d.asset}</td>
                        <td style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {d.units != null ? fmtNum(d.units, 6) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {d.pricePerUnit != null ? fmt(d.pricePerUnit) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--amber)', whiteSpace: 'nowrap' }}>{fmt(d.amount)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="icon-btn danger" onClick={() => handleDeleteDeployment(d.id)} title="Delete">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {modal && (
        <ScheduleModal item={modal.item} accounts={accounts} onClose={() => setModal(null)} onSave={saveSchedule} />
      )}
      {deployModal && (
        <DeployModal poolId={deployModal} pool={pools[deployModal]} data={data} prices={prices} onClose={() => setDeployModal(null)} onDeploy={handleDeploy} />
      )}
      {editContrib && (
        <EditValueModal
          label={editContrib.label}
          value={pools[editContrib.poolId]?.[editContrib.field] ?? 0}
          onClose={() => setEditContrib(null)}
          onSave={v => updateData('pools', { ...pools, [editContrib.poolId]: { ...pools[editContrib.poolId], [editContrib.field]: parseFloat(v) || 0 } })}
        />
      )}
    </div>
  )
}
