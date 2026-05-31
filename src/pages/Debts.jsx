import { useState } from 'react'
import { fmt, fmtFull, genId } from '../utils'
import { Modal } from '../components/Modal'

const DEBT_TYPES = ['Student Loan', 'Car Loan', 'Mortgage', 'Personal Loan', 'BNPL', 'Other']

const TYPE_COLOR = {
  'Student Loan': '#5b9ef0',
  'Car Loan': '#f0a500',
  'Mortgage': '#4caf7d',
  'Personal Loan': '#a87ef0',
  'BNPL': '#e05b5b',
  'Other': '#6b7280',
}

function payoffDate(remaining, monthly) {
  if (!monthly || monthly <= 0 || !remaining || remaining <= 0) return null
  const months = Math.ceil(remaining / monthly)
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
}

function DebtModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    name: '', type: 'Student Loan', originalAmount: 0, remaining: 0, monthlyPayment: 0, interestRate: 0,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const num = (k, v) => set(k, parseFloat(v) || 0)

  const paidOff = form.originalAmount > 0 ? Math.max(0, form.originalAmount - form.remaining) : 0
  const pctPaid = form.originalAmount > 0 ? Math.min(100, (paidOff / form.originalAmount) * 100) : 0
  const payoff = payoffDate(form.remaining, form.monthlyPayment)

  return (
    <Modal title={item ? 'Edit Debt' : 'Add Debt'} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HECS Student Debt" />
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
          {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Original Amount</label>
          <input className="form-input" type="number" step="any" min="0" value={form.originalAmount} onChange={e => num('originalAmount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Remaining Balance</label>
          <input className="form-input" type="number" step="any" min="0" value={form.remaining} onChange={e => num('remaining', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Monthly Payment (optional)</label>
          <input className="form-input" type="number" step="any" min="0" value={form.monthlyPayment} onChange={e => num('monthlyPayment', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Interest Rate % (optional)</label>
          <input className="form-input" type="number" step="any" min="0" value={form.interestRate} onChange={e => num('interestRate', e.target.value)} />
        </div>
      </div>
      {form.originalAmount > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          {pctPaid.toFixed(1)}% paid off
          {payoff && <span style={{ marginLeft: 12 }}>Est. payoff: <span style={{ color: 'var(--text)' }}>{payoff}</span></span>}
        </div>
      )}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function DebtCard({ item, onEdit, onDelete }) {
  const color = TYPE_COLOR[item.type] || '#6b7280'
  const paidOff = item.originalAmount > 0 ? Math.max(0, item.originalAmount - item.remaining) : 0
  const pctPaid = item.originalAmount > 0 ? Math.min(100, (paidOff / item.originalAmount) * 100) : 0
  const payoff = payoffDate(item.remaining, item.monthlyPayment)
  const isBlank = !item.originalAmount && !item.remaining

  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}`, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.name}</div>
          <span className="badge" style={{ background: `${color}18`, color, fontSize: 11 }}>{item.type}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" onClick={() => onEdit(item)} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={() => onDelete(item.id)} title="Delete">✕</button>
        </div>
      </div>

      {isBlank ? (
        <div style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>No amounts entered yet — click edit to fill in your balance.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Remaining</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--red)' }}>{fmt(item.remaining)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Original</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>{fmt(item.originalAmount)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Monthly</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>{item.monthlyPayment > 0 ? fmt(item.monthlyPayment) : '—'}</div>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pctPaid.toFixed(1)}% paid off</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(paidOff)} cleared</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${pctPaid}%`, background: color }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            {item.interestRate > 0 && <span>Interest: <span style={{ color: 'var(--text)' }}>{item.interestRate}% p.a.</span></span>}
            {payoff && <span>Est. payoff: <span style={{ color: 'var(--green)' }}>{payoff}</span></span>}
          </div>
        </>
      )}
    </div>
  )
}

export function Debts({ data, updateData }) {
  const [modal, setModal] = useState(null)
  const debts = data.debts ?? []

  const totalDebt = debts.reduce((s, d) => s + (d.remaining || 0), 0)
  const totalOriginal = debts.reduce((s, d) => s + (d.originalAmount || 0), 0)
  const totalMonthly = debts.reduce((s, d) => s + (d.monthlyPayment || 0), 0)
  const totalCleared = totalOriginal > 0 ? Math.max(0, totalOriginal - totalDebt) : 0
  const overallPct = totalOriginal > 0 ? Math.min(100, (totalCleared / totalOriginal) * 100) : 0

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Debts & Liabilities</div>
          <div className="page-subtitle">Track and eliminate what you owe</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ item: null })}>+ Add Debt</button>
      </div>

      {/* Summary cards */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Total Debt</div>
          <div className="stat-value" style={{ color: totalDebt > 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(totalDebt)}</div>
          <div className="stat-sub">{debts.length} entr{debts.length === 1 ? 'y' : 'ies'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Payments</div>
          <div className="stat-value">{fmt(totalMonthly)}</div>
          <div className="stat-sub">per month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Progress</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{overallPct.toFixed(1)}%</div>
          <div className="stat-sub">{fmt(totalCleared)} cleared</div>
        </div>
      </div>

      {totalOriginal > 0 && (
        <div className="card" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Debt Cleared</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{fmt(totalCleared)} of {fmt(totalOriginal)}</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #e05b5b, #f0a500)' }} />
          </div>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No debts tracked</div>
          <div style={{ fontSize: 13 }}>Add your debts to track payoff progress and factor them into your true net worth.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {debts.map(d => (
            <DebtCard key={d.id} item={d}
              onEdit={item => setModal({ item })}
              onDelete={id => updateData('debts', debts.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}

      {modal && (
        <DebtModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) {
              updateData('debts', debts.map(d => d.id === modal.item.id ? { ...d, ...form } : d))
            } else {
              updateData('debts', [...debts, { ...form, id: genId() }])
            }
          }}
        />
      )}
    </div>
  )
}
