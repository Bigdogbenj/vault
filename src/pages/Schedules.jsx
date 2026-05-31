import { useState, useMemo } from 'react'
import { fmt, genId, getNextFireTime } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'
import { DEFAULTS } from '../data/defaults'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FREQ_LABELS = { once: 'Once', weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Quarterly' }

const POOL_CONFIG = {
  crypto: { label: 'Crypto Pool',  color: '#a87ef0', icon: '🔮' },
  stocks: { label: 'Stocks Pool',  color: '#4caf7d', icon: '📈' },
  etfs:   { label: 'ETF Pool',     color: '#5b9ef0', icon: '🏦' },
}

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
  const fromName = s.type === 'income'
    ? (s.sourceLabel || 'Income')
    : (accounts.find(a => a.id === s.fromAccount)?.name ?? '—')
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
  const typeColor = s.type === 'income' ? 'var(--green)' : 'var(--blue)'
  const typeBg   = s.type === 'income' ? 'rgba(76,175,125,0.12)' : 'rgba(91,158,240,0.12)'

  return (
    <div className="card" style={{ padding: '16px 18px', borderLeft: `3px solid ${s.type === 'income' ? '#4caf7d' : '#5b9ef0'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>{s.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: typeBg, color: typeColor, flexShrink: 0 }}>
              {s.type === 'income' ? 'Income' : 'Transfer'}
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
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: typeColor }}>{fmt(s.amount)}</div>
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

      {form.type === 'income' ? (
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
      ) : (
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

function PoolCard({ poolId, pool, onDeploy, onEditContrib }) {
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
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: cfg.color }}>{fmt(pool.available)}</div>
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

function DeployModal({ poolId, pool, data, onClose, onDeploy }) {
  const cfg = POOL_CONFIG[poolId]
  const assets = poolId === 'crypto' ? data.crypto.map(c => c.symbol)
               : poolId === 'stocks' ? data.stocks.map(s => s.ticker)
               : data.etfs.map(e => e.ticker)

  const [amount, setAmount] = useState(String(pool.available || 0))
  const [asset, setAsset] = useState(assets[0] ?? '')
  const [date, setDate] = useState(TODAY)

  const handleConfirm = () => {
    const amt = parseFloat(amount) || 0
    if (amt <= 0 || !asset) return
    onDeploy({ poolId, amount: amt, asset, deployedAt: new Date(date + 'T12:00:00').toISOString() })
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
        <label className="form-label">Amount</label>
        <input className="form-input" type="number" step="any" min="0" max={pool.available} value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Asset</label>
        <select className="form-select" value={asset} onChange={e => setAsset(e.target.value)}>
          {assets.length === 0 ? <option value="">No assets in portfolio</option> : assets.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Date</label>
        <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
        This records the deployment but does not update portfolio holdings — add the transaction manually.
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleConfirm}
          style={{ background: cfg.color, opacity: parseFloat(amount) > 0 ? 1 : 0.5 }}>
          Confirm Deploy
        </button>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Schedules({ data, updateData }) {
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

  const handleDeploy = ({ poolId, amount, asset, deployedAt }) => {
    const newDeployment = { id: genId(), poolId, amount, asset, deployedAt }
    const updatedPools = {
      ...pools,
      [poolId]: {
        ...pools[poolId],
        available: Math.max(0, (pools[poolId].available || 0) - amount),
        deployedTotal: (pools[poolId].deployedTotal || 0) + amount,
        lastDeployedAt: deployedAt,
        lastDeployedAmount: amount,
      },
    }
    updateData('pools', updatedPools)
    updateData('poolDeployments', [newDeployment, ...poolDeployments])
  }

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
          {schedules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No schedules yet</div>
              <div style={{ fontSize: 13 }}>Add a schedule to automate your transfers</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {schedules.map(s => (
                <ScheduleCard
                  key={s.id}
                  schedule={s}
                  accounts={accounts}
                  onEdit={() => setModal({ item: s })}
                  onDelete={() => deleteSchedule(s.id)}
                  onToggle={() => toggleSchedule(s.id)}
                />
              ))}
            </div>
          )}

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
                      <th>From</th>
                      <th>To</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferLog.map(entry => (
                      <tr key={entry.id}>
                        <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtLogDate(entry.firedAt)}</td>
                        <td style={{ fontWeight: 600 }}>{entry.scheduleName}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{entry.fromLabel}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{entry.toLabel}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: entry.type === 'income' ? 'var(--green)' : 'var(--text)', whiteSpace: 'nowrap' }}>
                          {entry.type === 'income' ? '+' : ''}{fmt(entry.amount)}
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

      {/* ── Investment Pools tab ───────────────────────────────────── */}
      {tab === 'pools' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Object.entries(pools).map(([id, pool]) => (
              <PoolCard
                key={id}
                poolId={id}
                pool={pool}
                onDeploy={() => setDeployModal(id)}
                onEditContrib={() => setEditContrib({ poolId: id, field: 'weeklyContribution', label: `${POOL_CONFIG[id].label} Weekly Contribution` })}
              />
            ))}
          </div>

          {/* Deployment History */}
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
                      <th style={{ textAlign: 'right' }}>Amount</th>
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
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--amber)', whiteSpace: 'nowrap' }}>{fmt(d.amount)}</td>
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
        <ScheduleModal
          item={modal.item}
          accounts={accounts}
          onClose={() => setModal(null)}
          onSave={saveSchedule}
        />
      )}

      {deployModal && (
        <DeployModal
          poolId={deployModal}
          pool={pools[deployModal]}
          data={data}
          onClose={() => setDeployModal(null)}
          onDeploy={handleDeploy}
        />
      )}

      {editContrib && (
        <EditValueModal
          label={editContrib.label}
          value={pools[editContrib.poolId]?.[editContrib.field] ?? 0}
          onClose={() => setEditContrib(null)}
          onSave={v => {
            updateData('pools', {
              ...pools,
              [editContrib.poolId]: { ...pools[editContrib.poolId], [editContrib.field]: parseFloat(v) || 0 },
            })
          }}
        />
      )}
    </div>
  )
}
