import { useState } from 'react'
import { fmt, genId } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'

const CATEGORIES = [
  { id: 'Holiday',    label: 'Holiday',    emoji: '✈️',  color: '#5b9ef0' },
  { id: 'Tech',       label: 'Tech',       emoji: '💻',  color: '#a87ef0' },
  { id: 'Investment', label: 'Investment', emoji: '📈',  color: '#4caf7d' },
  { id: 'Emergency',  label: 'Emergency',  emoji: '🛡️',  color: '#4caf7d' },
  { id: 'Car',        label: 'Car',        emoji: '🚗',  color: '#f0a500' },
  { id: 'House',      label: 'House',      emoji: '🏠',  color: '#f07a30' },
  { id: 'Crypto',     label: 'Crypto',     emoji: '🔐',  color: '#a87ef0' },
  { id: 'Other',      label: 'Other',      emoji: '🎯',  color: '#6b7280' },
]

const CONGRATS = {
  Holiday:    "Passport ready. Time to collect some memories. ✈️",
  Tech:       "Unbox it. You earned it. 💻",
  Investment: "Stack secured. Your future self just got a little richer. 📈",
  Emergency:  "Sleep easy — you're untouchable now. 🛡️",
  Car:        "Keys are yours. Drive safe, legend. 🚗",
  House:      "Home is where the savings went. Well done. 🏠",
  Crypto:     "Wallet loaded. Make it count. 🔐",
  Other:      "Another goal conquered. What's next? 🎯",
}

const COLORS = ['#4caf7d', '#5b9ef0', '#a87ef0', '#f0a500', '#e05b5b', '#f07a30', '#f06050']

function inferCategory(icon) {
  const map = { '✈️': 'Holiday', '💻': 'Tech', '📈': 'Investment', '🛡️': 'Emergency', '🚗': 'Car', '🏠': 'House', '🔐': 'Crypto' }
  return map[icon] || 'Other'
}

function normalizeGoal(g) {
  return {
    category: inferCategory(g.icon || '🎯'),
    targetDate: null,
    startingAmount: 0,
    createdAt: null,
    completed: false,
    completedAt: null,
    ...g,
  }
}

function getCat(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

function fmtShortDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtMonthYear(ms) {
  return new Date(ms).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
}

function weeksBetween(fromIso, toIso) {
  const ms = new Date(toIso || Date.now()).getTime() - new Date(fromIso).getTime()
  return Math.max(1, Math.floor(ms / (7 * 24 * 3600 * 1000)))
}

// ─── Goal Modal ──────────────────────────────────────────────────────────────

function GoalModal({ item, onClose, onSave }) {
  const defaultForm = {
    name: '', category: 'Other', target: 0, current: 0, startingAmount: 0,
    monthly: 0, color: '#4caf7d', targetDate: '',
    createdAt: new Date().toISOString(), completed: false, completedAt: null,
  }
  const [form, setForm] = useState(item ? normalizeGoal(item) : defaultForm)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const cat = getCat(form.category)
    onSave({ ...form, icon: cat.emoji })
    onClose()
  }

  return (
    <Modal title={item ? 'Edit Goal' : 'Add Goal'} onClose={onClose} size="modal-lg">
      <div className="form-group">
        <label className="form-label">Goal Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Europe Trip" autoFocus />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => set('category', cat.id)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${form.category === cat.id ? cat.color : 'var(--border)'}`,
              background: form.category === cat.id ? `${cat.color}20` : 'transparent',
              color: form.category === cat.id ? cat.color : 'var(--muted)',
              transition: 'all 0.12s',
            }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Target Amount</label>
          <input className="form-input" type="number" step="1" min="0" value={form.target} onChange={e => set('target', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Current Saved</label>
          <input className="form-input" type="number" step="1" min="0" value={form.current} onChange={e => set('current', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Starting Amount <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>(when tracking began)</span></label>
          <input className="form-input" type="number" step="1" min="0" value={form.startingAmount} onChange={e => set('startingAmount', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Contribution</label>
          <input className="form-input" type="number" step="1" min="0" value={form.monthly} onChange={e => set('monthly', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Target Date <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
        <input className="form-input" type="date" value={form.targetDate || ''} onChange={e => set('targetDate', e.target.value || null)} />
      </div>

      <div className="form-group">
        <label className="form-label">Colour</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
          <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

// ─── Completed Goal Stats Modal ───────────────────────────────────────────────

function CompletedGoalModal({ goal, onClose }) {
  const g = normalizeGoal(goal)
  const cat = getCat(g.category)
  const weeks = g.createdAt && g.completedAt ? weeksBetween(g.createdAt, g.completedAt) : null
  const totalContributed = Math.max(0, g.current - (g.startingAmount || 0))
  const avgWeekly = weeks && totalContributed > 0 ? totalContributed / weeks : null
  const congrats = CONGRATS[g.category] ?? CONGRATS.Other

  let vsTarget = null
  if (g.targetDate && g.completedAt) {
    const diffMs = new Date(g.targetDate).getTime() - new Date(g.completedAt).getTime()
    const weeksOff = Math.abs(Math.round(diffMs / (7 * 24 * 3600 * 1000)))
    if (diffMs > 0) vsTarget = { label: `${weeksOff} week${weeksOff !== 1 ? 's' : ''} early`, color: 'var(--green)', icon: '🚀' }
    else if (diffMs < 0) vsTarget = { label: `${weeksOff} week${weeksOff !== 1 ? 's' : ''} late`, color: 'var(--amber)', icon: '⏰' }
    else vsTarget = { label: 'Right on time!', color: 'var(--green)', icon: '🎯' }
  }

  const stats = [
    { label: 'Target',       value: fmt(g.target) },
    { label: 'Total Saved',  value: fmt(g.current), color: 'var(--green)' },
    { label: 'Contributed',  value: fmt(totalContributed) },
    ...(weeks != null ? [{ label: 'Time Taken', value: weeks < 8 ? `${weeks} weeks` : `${Math.round(weeks / 4.33)} months` }] : []),
    ...(avgWeekly != null ? [{ label: 'Avg per Week', value: fmt(avgWeekly) }] : []),
    ...(g.completedAt ? [{ label: 'Date Completed', value: fmtShortDate(g.completedAt) }] : []),
    ...(g.createdAt ? [{ label: 'Date Started', value: fmtShortDate(g.createdAt) }] : []),
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg modal-animate" style={{ borderTop: '3px solid #f0a500' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: 'rgba(240,165,0,0.12)', border: '1.5px solid rgba(240,165,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>🏆</div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 20 }}>{g.name}</div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginTop: 4, display: 'inline-block',
                background: `${cat.color}20`, color: cat.color,
              }}>{cat.emoji} {cat.label}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: 18, color: 'var(--muted)', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: s.color || 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {vsTarget && (
          <div style={{
            background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>{vsTarget.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Compared to Target Date</div>
              <div style={{ fontWeight: 700, color: vsTarget.color }}>{vsTarget.label}</div>
            </div>
          </div>
        )}

        <div style={{
          background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)',
          borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text)',
        }}>
          "{congrats}"
        </div>
      </div>
    </div>
  )
}

// ─── Active Goal Card ─────────────────────────────────────────────────────────

function ActiveGoalCard({ goal, onEdit, onDelete, onComplete, onQuickEdit }) {
  const g = normalizeGoal(goal)
  const cat = getCat(g.category)
  const pct = Math.min(100, g.target > 0 ? Math.round((g.current / g.target) * 100) : 0)
  const remaining = Math.max(0, g.target - g.current)
  const isReady = g.current >= g.target

  const monthly = g.monthly || 0
  const weekly = monthly > 0 ? monthly / 4.33 : null
  const fortnightly = monthly > 0 ? monthly / 2.17 : null

  let estDateStr = null
  if (g.targetDate) {
    const td = new Date(g.targetDate)
    if (td > new Date()) estDateStr = td.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
  }
  if (!estDateStr && monthly > 0 && remaining > 0) {
    estDateStr = fmtMonthYear(Date.now() + (remaining / monthly) * 30.44 * 24 * 3600 * 1000)
  }

  const weeksActive = g.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(g.createdAt).getTime()) / (7 * 24 * 3600 * 1000)))
    : null

  return (
    <div className="card" style={{ borderLeft: `3px solid ${g.color}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.emoji}</span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{g.name}</div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 3, display: 'inline-block',
              background: `${cat.color}18`, color: cat.color,
            }}>{cat.label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
          {isReady && (
            <button onClick={() => onComplete(g)} style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(240,165,0,0.12)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.3)',
            }}>🏆 Complete</button>
          )}
          <button className="icon-btn" onClick={onEdit} title="Edit">✎</button>
          <button className="icon-btn danger" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>

      {/* Amounts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span
          title="Click to update balance"
          onClick={onQuickEdit}
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, cursor: 'pointer', borderBottom: '1px dashed var(--border)' }}
        >{fmt(g.current)}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          of <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(g.target)}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ height: 8, borderRadius: 4, marginBottom: 6 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: g.color, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{pct}% complete</span>
        <span style={{ fontSize: 11, color: isReady ? 'var(--green)' : 'var(--muted)' }}>
          {isReady ? '🎉 Target reached!' : `${fmt(remaining)} to go`}
        </span>
      </div>

      {/* Stats footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {estDateStr && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Est. Complete</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{estDateStr}</div>
            </div>
          )}
          {weekly != null && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Weekly</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(weekly)}</div>
            </div>
          )}
          {fortnightly != null && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Fortnightly</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(fortnightly)}</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            Monthly: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(monthly)}</span>
          </span>
          {weeksActive != null && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              🔥 {weeksActive} week{weeksActive !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Completed Goal Card ──────────────────────────────────────────────────────

function CompletedGoalCard({ goal, onClick }) {
  const g = normalizeGoal(goal)
  const cat = getCat(g.category)
  const weeks = g.createdAt && g.completedAt ? weeksBetween(g.createdAt, g.completedAt) : null
  const totalContributed = Math.max(0, g.current - (g.startingAmount || 0))
  const avgWeekly = weeks && totalContributed > 0 ? totalContributed / weeks : null
  const timeTakenStr = weeks != null ? (weeks < 8 ? `${weeks} wk` : `${Math.round(weeks / 4.33)} mo`) : null

  return (
    <div
      className="card"
      onClick={onClick}
      style={{ borderTop: '2px solid #f0a500', cursor: 'pointer', transition: 'transform 0.12s, box-shadow 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,165,0,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <span style={{ fontSize: 22 }}>{cat.emoji}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: `${cat.color}18`, color: cat.color,
          }}>{cat.label}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>View stats →</span>
      </div>

      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{g.name}</div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Total Saved</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{fmt(g.current)}</div>
        </div>
        {timeTakenStr && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Time Taken</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{timeTakenStr}</div>
          </div>
        )}
        {avgWeekly != null && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>Avg / Week</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(avgWeekly)}</div>
          </div>
        )}
      </div>

      {g.completedAt && (
        <div style={{ fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          Completed {fmtShortDate(g.completedAt)}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Goals({ data, updateData }) {
  const [modal, setModal] = useState(null)
  const [completedModal, setCompletedModal] = useState(null)
  const [quickEdit, setQuickEdit] = useState(null)

  const allGoals = data.goals.map(normalizeGoal)
  const activeGoals = allGoals.filter(g => !g.completed)
  const completedGoals = allGoals.filter(g => g.completed)

  const totalActiveSaved = activeGoals.reduce((s, g) => s + (g.current || 0), 0)
  const totalCompletedSaved = completedGoals.reduce((s, g) => s + (g.current || 0), 0)

  const saveGoal = (form) => {
    if (modal?.item) {
      updateData('goals', data.goals.map(g => g.id === modal.item.id ? { ...g, ...form } : g))
    } else {
      updateData('goals', [...data.goals, { ...form, id: genId() }])
    }
  }

  const completeGoal = (g) => {
    updateData('goals', data.goals.map(x => x.id === g.id
      ? { ...x, completed: true, completedAt: new Date().toISOString() }
      : x
    ))
  }

  const deleteGoal = (id) => updateData('goals', data.goals.filter(x => x.id !== id))

  return (
    <div className="page">
      {/* ── Stats bar ── */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-label">Active Goals</div>
          <div className="stat-value text-amber">{activeGoals.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Active Saved</div>
          <div className="stat-value text-green">{fmt(totalActiveSaved)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Goals Completed</div>
          <div className="stat-value" style={{ color: '#f0a500' }}>{completedGoals.length}</div>
          <div className="stat-sub">{completedGoals.length > 0 ? '🏆 Hall of Fame' : 'Complete a goal to unlock'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All-Time Saved</div>
          <div className="stat-value text-green">{fmt(totalActiveSaved + totalCompletedSaved)}</div>
          <div className="stat-sub">Across all goals</div>
        </div>
      </div>

      {/* ── Active Goals ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="section-title">Active Goals</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {activeGoals.length === 0 ? 'No active goals — add one to get started' : `${activeGoals.length} goal${activeGoals.length !== 1 ? 's' : ''} in progress`}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ item: null })}>+ Add Goal</button>
        </div>

        {activeGoals.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {activeGoals.map(g => (
              <ActiveGoalCard
                key={g.id}
                goal={g}
                onEdit={() => setModal({ item: g })}
                onDelete={() => deleteGoal(g.id)}
                onComplete={() => completeGoal(g)}
                onQuickEdit={() => setQuickEdit({ goal: g, field: 'current', label: 'Current Saved' })}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No active goals yet</div>
            <div style={{ fontSize: 13 }}>Add a goal to start tracking your progress</div>
          </div>
        )}
      </div>

      {/* ── Hall of Fame ── */}
      {completedGoals.length > 0 && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div className="section-title" style={{ color: '#f0a500' }}>Hall of Fame</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, marginLeft: 28 }}>
              {completedGoals.length} goal{completedGoals.length !== 1 ? 's' : ''} conquered · {fmt(totalCompletedSaved)} total saved
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {completedGoals.map(g => (
              <CompletedGoalCard
                key={g.id}
                goal={g}
                onClick={() => setCompletedModal(g)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <GoalModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={saveGoal}
        />
      )}

      {completedModal && (
        <CompletedGoalModal
          goal={completedModal}
          onClose={() => setCompletedModal(null)}
        />
      )}

      {quickEdit && (
        <EditValueModal
          label={quickEdit.label}
          value={quickEdit.goal[quickEdit.field]}
          onClose={() => setQuickEdit(null)}
          onSave={v => {
            updateData('goals', data.goals.map(g =>
              g.id === quickEdit.goal.id ? { ...g, [quickEdit.field]: parseFloat(v) || 0 } : g
            ))
          }}
        />
      )}
    </div>
  )
}
