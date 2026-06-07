import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt, genId, toMonthly, CATEGORY_COLORS } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'

const CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transport', 'Subscriptions', 'Entertainment', 'Health', 'Other']
const FREQUENCIES = ['weekly', 'fortnightly', 'monthly', 'quarterly']
const FREQ_LABELS = { weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Quarterly' }
const FREQ_BADGE = { weekly: 'badge-blue', fortnightly: 'badge-purple', monthly: 'badge-muted', quarterly: 'badge-amber' }

const ALLOC_CATEGORIES = ['Crypto', 'Stocks', 'ETFs', 'Savings', 'Goals', 'Leisure', 'Other']
const ALLOC_COLORS = {
  Crypto:  '#f0a500',
  Stocks:  '#5b9ef0',
  ETFs:    '#4caf7d',
  Savings: '#a87ef0',
  Goals:   '#26c6da',
  Leisure: '#6b7280',
  Other:   '#9e9e9e',
}

function IncomeModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', amount: 0 })
  return (
    <Modal title={item ? 'Edit Income' : 'Add Income'} onClose={onClose} size="modal-sm">
      <div className="form-group">
        <label className="form-label">Source</label>
        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Salary" autoFocus />
      </div>
      <div className="form-group">
        <label className="form-label">Monthly Amount (AUD)</label>
        <input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function ExpenseModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', amount: 0, category: 'Other', frequency: 'monthly' })
  const monthly = toMonthly(form.amount, form.frequency)
  const showConversion = form.frequency !== 'monthly'
  return (
    <Modal title={item ? 'Edit Expense' : 'Add Expense'} onClose={onClose} size="modal-sm">
      <div className="form-group">
        <label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rent" autoFocus />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select className="form-select" value={form.frequency || 'monthly'} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Amount per {FREQ_LABELS[form.frequency || 'monthly'].toLowerCase()} period (AUD)</label>
        <input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
        {showConversion && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            Monthly equivalent: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(monthly)}</span>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onSave(form); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}

function AllocModal({ onClose, onSave }) {
  const [form, setForm] = useState({ label: '', category: 'Crypto', amount: 0 })
  return (
    <Modal title="Add Allocation" onClose={onClose} size="modal-sm">
      <div className="form-group">
        <label className="form-label">Label</label>
        <input
          className="form-input"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          placeholder="e.g. BTC buys, Date nights"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {ALLOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Monthly Amount (AUD)</label>
        <input
          className="form-input"
          type="number"
          step="10"
          min="0"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (form.label.trim()) { onSave({ ...form, id: genId() }); onClose() } }}>Add</button>
      </div>
    </Modal>
  )
}

export function Budget({ data, updateData }) {
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [allocModal, setAllocModal] = useState(false)

  const totalIncome = useMemo(() => data.budget.income.reduce((s, i) => s + i.amount, 0), [data.budget.income])
  const totalExpenses = useMemo(
    () => data.budget.expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0),
    [data.budget.expenses]
  )
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100) : 0

  const monthlyDisposable = savings
  const monthlyAllocations = data.monthlyAllocations ?? []
  const totalMonthlyAllocated = monthlyAllocations.reduce((s, a) => s + a.amount, 0)
  const unallocated = monthlyDisposable - totalMonthlyAllocated

  const allocPct = monthlyDisposable > 0 ? Math.min((totalMonthlyAllocated / monthlyDisposable) * 100, 120) : 0
  const allocBarColor = monthlyDisposable <= 0 ? 'var(--muted)'
    : totalMonthlyAllocated > monthlyDisposable ? 'var(--red)'
    : totalMonthlyAllocated / monthlyDisposable >= 0.9 ? 'var(--amber)'
    : 'var(--green)'

  const stackedSegments = useMemo(() => {
    const groups = {}
    monthlyAllocations.forEach(a => {
      groups[a.category] = (groups[a.category] || 0) + a.amount
    })
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([cat, total]) => ({ cat, total, color: ALLOC_COLORS[cat] || '#9e9e9e' }))
  }, [monthlyAllocations])

  const pieData = useMemo(() => {
    const groups = {}
    data.budget.expenses.forEach(e => {
      groups[e.category] = (groups[e.category] || 0) + toMonthly(e.amount, e.frequency)
    })
    return Object.entries(groups).map(([cat, val]) => ({ name: cat, value: val, color: CATEGORY_COLORS[cat] || '#6b7280' }))
  }, [data.budget.expenses])

  const updateBudget = (key, val) => updateData('budget', { ...data.budget, [key]: val })

  return (
    <div className="page">
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value text-green">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value text-red">{fmt(totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Savings</div>
          <div className="stat-value" style={{ color: savings >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(savings)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Savings Rate</div>
          <div className="stat-value text-amber" style={{ fontSize: 28 }}>{savingsRate.toFixed(0)}%</div>
          <div className="stat-sub">{fmt(savings)}/month available</div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${Math.min(100, savingsRate)}%`, background: 'var(--amber)' }} />
          </div>
        </div>
      </div>

      {/* Disposable Income Allocation Planner */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Disposable Income Planner</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{fmt(monthlyDisposable)}/month to allocate</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAllocModal(true)}>+ Add Allocation</button>
        </div>

        {/* Allocation status bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Monthly Disposable Income: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(monthlyDisposable)}</span>
            </span>
            <span style={{ fontSize: 12, color: allocBarColor, fontWeight: 600 }}>
              {monthlyDisposable > 0 ? `${Math.min(Math.round((totalMonthlyAllocated / monthlyDisposable) * 100), 999)}% allocated` : '—'}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10, borderRadius: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, allocPct)}%`, background: allocBarColor, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>
              <span style={{ color: allocBarColor, fontWeight: 600 }}>{fmt(totalMonthlyAllocated)}</span> allocated
            </span>
            <span style={{ color: unallocated >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {fmt(Math.abs(unallocated))} {unallocated >= 0 ? 'remaining' : 'over budget'}
            </span>
          </div>
        </div>

        {/* Allocation list */}
        {monthlyAllocations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13, borderTop: '1px solid var(--border)' }}>
            No allocations yet — add one to start planning your disposable income
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            {monthlyAllocations.map(alloc => {
              const color = ALLOC_COLORS[alloc.category] || '#9e9e9e'
              const barPct = monthlyDisposable > 0 ? Math.min((alloc.amount / monthlyDisposable) * 100, 100) : 0
              return (
                <div key={alloc.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{alloc.label}</span>
                      <span className="badge" style={{ background: `${color}22`, color, fontSize: 10, padding: '2px 7px' }}>{alloc.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={alloc.amount}
                        onChange={e => updateData('monthlyAllocations', monthlyAllocations.map(a => a.id === alloc.id ? { ...a, amount: parseFloat(e.target.value) || 0 } : a))}
                        style={{ width: 80, padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color, fontWeight: 700, textAlign: 'right', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif' }}
                      />
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>/mo</span>
                      <button className="icon-btn danger" onClick={() => updateData('monthlyAllocations', monthlyAllocations.filter(a => a.id !== alloc.id))}>✕</button>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 4, borderRadius: 3 }}>
                    <div className="progress-fill" style={{ width: `${barPct}%`, background: color, borderRadius: 3 }} />
                  </div>
                  {monthlyDisposable > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                      {barPct.toFixed(1)}% of disposable income
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Stacked category bar */}
        {stackedSegments.length > 0 && monthlyDisposable > 0 && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Allocation by Category</div>
            <div style={{ display: 'flex', height: 18, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {stackedSegments.map(seg => (
                <div
                  key={seg.cat}
                  title={`${seg.cat}: ${fmt(seg.total)}`}
                  style={{
                    width: `${Math.min(100, (seg.total / monthlyDisposable) * 100)}%`,
                    background: seg.color,
                    minWidth: 3,
                    transition: 'width 0.3s',
                  }}
                />
              ))}
              {unallocated > 0 && (
                <div style={{ flex: 1, background: 'var(--surface2)', minWidth: 2 }} />
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 10 }}>
              {stackedSegments.map(seg => (
                <div key={seg.cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{seg.cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(seg.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Income */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Income</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'income', item: null })}>+ Add</button>
          </div>
          <table>
            <thead><tr><th>Source</th><th>Amount</th><th>%</th><th></th></tr></thead>
            <tbody>
              {data.budget.income.map(inc => (
                <tr key={inc.id}>
                  <td>{inc.name}</td>
                  <td>
                    <span className="editable-val" onClick={() => setEditItem({ item: inc, type: 'income' })} style={{ fontWeight: 600 }}>
                      {fmt(inc.amount)}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>per month</div>
                  </td>
                  <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{totalIncome > 0 ? (inc.amount / totalIncome * 100).toFixed(0) : 0}%</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => setModal({ type: 'income', item: inc })}>✎</button>
                      <button className="icon-btn danger" onClick={() => updateBudget('income', data.budget.income.filter(i => i.id !== inc.id))}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(totalIncome)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Expenses</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'expense', item: null })}>+ Add</button>
          </div>
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Amount</th><th>Monthly</th><th></th></tr></thead>
            <tbody>
              {data.budget.expenses.map(exp => {
                const freq = exp.frequency || 'monthly'
                const monthly = toMonthly(exp.amount, freq)
                const isMonthly = freq === 'monthly'
                return (
                  <tr key={exp.id}>
                    <td>{exp.name}</td>
                    <td>
                      <span className="badge" style={{ background: `${CATEGORY_COLORS[exp.category] || '#6b7280'}18`, color: CATEGORY_COLORS[exp.category] || 'var(--muted)' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td>
                      <span className="editable-val" onClick={() => setEditItem({ item: exp, type: 'expense' })} style={{ fontWeight: 600 }}>
                        {fmt(exp.amount)}
                      </span>
                      <div style={{ marginTop: 2 }}>
                        <span className={`badge ${FREQ_BADGE[freq]}`} style={{ fontSize: 10 }}>{FREQ_LABELS[freq]}</span>
                      </div>
                    </td>
                    <td>
                      {isMonthly
                        ? <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                        : <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(monthly)}</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="icon-btn" onClick={() => setModal({ type: 'expense', item: exp })}>✎</button>
                        <button className="icon-btn danger" onClick={() => updateBudget('expenses', data.budget.expenses.filter(e => e.id !== exp.id))}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Total (monthly)</span>
            <span style={{ fontWeight: 700, color: 'var(--red)' }}>{fmt(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Breakdown chart */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Expense Breakdown</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>monthly equivalents</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v), '/mo']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pieData.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="color-dot" style={{ background: e.color }} />
                <span style={{ flex: 1, fontSize: 13 }}>{e.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(e.value)}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', width: 38, textAlign: 'right' }}>{totalExpenses > 0 ? (e.value / totalExpenses * 100).toFixed(0) : 0}%</span>
                <div className="progress-bar" style={{ width: 80 }}>
                  <div className="progress-fill" style={{ width: `${totalExpenses > 0 ? (e.value / totalExpenses * 100).toFixed(0) : 0}%`, background: e.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal?.type === 'income' && (
        <IncomeModal item={modal.item} onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) updateBudget('income', data.budget.income.map(i => i.id === modal.item.id ? { ...i, ...form } : i))
            else updateBudget('income', [...data.budget.income, { ...form, id: genId() }])
          }}
        />
      )}

      {modal?.type === 'expense' && (
        <ExpenseModal item={modal.item} onClose={() => setModal(null)}
          onSave={form => {
            if (modal.item) updateBudget('expenses', data.budget.expenses.map(e => e.id === modal.item.id ? { ...e, ...form } : e))
            else updateBudget('expenses', [...data.budget.expenses, { ...form, id: genId() }])
          }}
        />
      )}

      {editItem && (
        <EditValueModal
          label={`${editItem.item.name} Amount (${FREQ_LABELS[editItem.item.frequency || 'monthly']})`}
          value={editItem.item.amount}
          onClose={() => setEditItem(null)}
          onSave={v => {
            const val = parseFloat(v) || 0
            if (editItem.type === 'income') updateBudget('income', data.budget.income.map(i => i.id === editItem.item.id ? { ...i, amount: val } : i))
            else updateBudget('expenses', data.budget.expenses.map(e => e.id === editItem.item.id ? { ...e, amount: val } : e))
          }}
        />
      )}

      {allocModal && (
        <AllocModal
          onClose={() => setAllocModal(false)}
          onSave={alloc => updateData('monthlyAllocations', [...monthlyAllocations, alloc])}
        />
      )}
    </div>
  )
}
