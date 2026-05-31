import { useState, useMemo } from 'react'
import { fmt } from '../utils'

const TRACKS = [
  {
    id: 'saver',
    name: 'The Saver',
    icon: '🏦',
    desc: 'Bank account balances',
    color: '#5b9ef0',
    levels: [
      { name: 'First Buffer',    threshold: 5000 },
      { name: 'Safety Net',      threshold: 10000 },
      { name: 'Emergency Ready', threshold: 20000 },
      { name: 'Cash Fortress',   threshold: 35000 },
      { name: 'War Chest',       threshold: 50000 },
      { name: 'Liquidity King',  threshold: 100000 },
    ],
  },
  {
    id: 'investor',
    name: 'The Investor',
    icon: '📈',
    desc: 'Stocks + ETF value',
    color: '#4caf7d',
    levels: [
      { name: 'First Position',     threshold: 2500 },
      { name: 'Portfolio Builder',  threshold: 7500 },
      { name: 'Market Participant', threshold: 15000 },
      { name: 'Equity Accumulator', threshold: 35000 },
      { name: 'Index Lord',         threshold: 75000 },
      { name: 'Market Sovereign',   threshold: 150000 },
    ],
  },
  {
    id: 'crypto',
    name: 'The Crypto Degen',
    icon: '🔮',
    desc: 'Total crypto value',
    color: '#a87ef0',
    levels: [
      { name: 'Bag Holder',       threshold: 2500 },
      { name: 'Diamond Hands',    threshold: 6000 },
      { name: 'On-Chain',         threshold: 15000 },
      { name: 'Whale Watching',   threshold: 30000 },
      { name: 'Actual Whale',     threshold: 75000 },
      { name: 'Crypto Sovereign', threshold: 150000 },
    ],
  },
  {
    id: 'planner',
    name: 'The Planner',
    icon: '🎯',
    desc: 'Financial discipline',
    color: '#f0a500',
    levels: [
      { name: 'Winging It',     threshold: 0 },
      { name: 'Aware',          threshold: 1 },
      { name: 'Intentional',    threshold: 2 },
      { name: 'Systematic',     threshold: 3 },
      { name: 'The Strategist', threshold: 4 },
      { name: 'Master Planner', threshold: 5 },
    ],
  },
  {
    id: 'builder',
    name: 'The Builder',
    icon: '🏗️',
    desc: 'Superannuation balance',
    color: '#f07a30',
    levels: [
      { name: 'Seeds Planted',    threshold: 10000 },
      { name: 'Compounding',      threshold: 25000 },
      { name: 'Long Game',        threshold: 50000 },
      { name: 'Retirement Aware', threshold: 100000 },
      { name: 'Future Proofed',   threshold: 250000 },
      { name: 'Set for Life',     threshold: 500000 },
    ],
  },
  {
    id: 'debt',
    name: 'Debt Slayer',
    icon: '⚔️',
    desc: '% of total debt paid off',
    color: '#e05b5b',
    levels: [
      { name: 'Debt Aware',        threshold: -1 },
      { name: 'Chipping Away',     threshold: 10 },
      { name: 'Momentum',          threshold: 25 },
      { name: 'Halfway There',     threshold: 50 },
      { name: 'The Final Stretch', threshold: 75 },
      { name: 'Debt Free',         threshold: 100 },
    ],
  },
]

const OVERALL_RANKS = [
  { grade: 'F', title: 'Broke Boy',     minAvg: 0, minNW: -Infinity },
  { grade: 'D', title: 'Scraping By',   minAvg: 2, minNW: 0 },
  { grade: 'C', title: 'Getting There', minAvg: 3, minNW: 0 },
  { grade: 'B', title: 'Wealth Aware',  minAvg: 4, minNW: 30000 },
  { grade: 'A', title: 'Wealth Builder',minAvg: 5, minNW: 80000 },
  { grade: 'S', title: 'The Vault',     minAvg: 5, minNW: 300000, requireAllFive: true },
]

const RANK_MESSAGES = {
  F: "Every legend starts somewhere. Make the first move.",
  D: "The foundation is forming. Keep stacking.",
  C: "Real momentum building. Most people never get here.",
  B: "You're playing the long game — and winning.",
  A: "Top tier. Wealth isn't luck, it's discipline.",
  S: "Generational wealth territory. The Vault is yours.",
}

const MOTIVATIONAL = {
  saver: [
    "A buffer exists. Most people have nothing. You're already ahead.",
    "Your safety net is real. One surprise won't break you now.",
    "Three months of runway. That's freedom most people never feel.",
    "Cash fortress activated. Sleep easy — you're covered.",
    "You're holding more cash than most people save in a lifetime.",
    "Liquidity King. You could survive anything the economy throws.",
  ],
  investor: [
    "Your first position is live. The market works for you now.",
    "Building real equity. This is how generational wealth starts.",
    "Market participant status earned. You're not just watching anymore.",
    "Equity accumulator. Compounding is silently making you rich.",
    "Index Lord unlocked. Just keep buying and let time do the work.",
    "Market Sovereign. Your portfolio outlasts any single market event.",
  ],
  crypto: [
    "Welcome to the degen life. Buy the dip. Hold the line.",
    "Diamond hands confirmed. You didn't sell at the bottom. Respect.",
    "On-chain and serious. The suits still don't understand this asset class.",
    "Whale watching? You're the whale now. Move carefully.",
    "Actual Whale. The market notices when you enter a position.",
    "Crypto Sovereign. Vires in Numeris. The code never lies.",
  ],
  planner: [
    "Using Vault is step one. Most people never even get this far.",
    "You know your numbers. That alone puts you ahead of 70% of people.",
    "Intentional money moves only. Your future self is already grateful.",
    "Systematic and deliberate. This is exactly how wealth compounds.",
    "The Strategist. Goals crushed, net worth climbing, no signs of stopping.",
    "Master Planner achieved. You have literally solved personal finance.",
  ],
  builder: [
    "The seed is planted. Compound interest has entered the chat.",
    "It's compounding now. Set it and forget it — seriously, don't touch it.",
    "Playing the long game, and playing it right. Future you approves.",
    "Retirement aware and funded. Most people your age can't say that.",
    "Future proofed. The government's pension plan? Optional for you.",
    "Set for Life. Your future self is living their absolute best life.",
  ],
  debt: [
    "Debt acknowledged. Naming the enemy is how you beat it.",
    "Chipping away. Every extra dollar you throw at this matters.",
    "Momentum is real now. The avalanche is picking up speed.",
    "Halfway there. The hardest psychological battle is behind you.",
    "The Final Stretch. Most people quit here. You're not most people.",
    "DEBT FREE. There is no better financial feeling in the world.",
  ],
}

function getLevelRequirement(track, idx) {
  if (track.id === 'planner') {
    const reqs = [
      'Just using Vault',
      'Budget has both income & expenses entered',
      '1+ goal completed or 10%+ savings rate',
      '20%+ savings rate',
      '3+ goals completed & positive net worth',
      '30%+ savings rate & all other tracks at Level 3+',
    ]
    return reqs[idx]
  }
  if (track.id === 'debt') {
    if (idx === 0) return 'Enter any debt amount'
    return `Pay off ${track.levels[idx].threshold}% of total debt`
  }
  return `Reach ${fmt(track.levels[idx].threshold)}`
}

function computeTrackLevel(track, value, data, savingsRate, completedGoals, netWorth, debts, otherTrackLevels) {
  if (track.id === 'planner') {
    const hasIncome = data.budget.income.some(i => (i.amount ?? 0) > 0)
    const hasExpenses = data.budget.expenses.some(e => (e.amount ?? 0) > 0)
    if (!hasIncome || !hasExpenses) return 0
    let lvl = 1
    if (completedGoals >= 1 || savingsRate >= 10) lvl = Math.max(lvl, 2)
    if (savingsRate >= 20) lvl = Math.max(lvl, 3)
    if (completedGoals >= 3 && netWorth > 0) lvl = Math.max(lvl, 4)
    if (savingsRate >= 30 && otherTrackLevels && otherTrackLevels.every(l => l >= 2)) lvl = Math.max(lvl, 5)
    return lvl
  }
  if (track.id === 'debt') {
    const hasDebts = debts.length > 0 && debts.some(d => (d.originalAmount ?? 0) > 0)
    if (!hasDebts) return -1
    const totalOrig = debts.reduce((s, d) => s + (d.originalAmount || 0), 0)
    const totalRemain = debts.reduce((s, d) => s + (d.remaining || 0), 0)
    const pct = totalOrig > 0 ? Math.min(100, ((totalOrig - totalRemain) / totalOrig) * 100) : 0
    if (pct >= 100) return 5
    if (pct >= 75) return 4
    if (pct >= 50) return 3
    if (pct >= 25) return 2
    if (pct >= 10) return 1
    return 0
  }
  const levels = track.levels
  let lvl = -1
  for (let i = 0; i < levels.length; i++) {
    if (value >= levels[i].threshold) lvl = i
    else break
  }
  return lvl
}

function getRowBarPct(track, idx, level, value) {
  if (idx < level) return 100
  if (idx > level && !(level === -1 && idx === 0)) return 0
  // current level (or approaching first level)
  if (track.id === 'planner') return 100
  if (track.id === 'debt') {
    const pctPaid = value?.pctPaid ?? 0
    if (level === 0) return Math.min(100, (pctPaid / 10) * 100)
    const cur = track.levels[level].threshold
    const next = level < 5 ? track.levels[level + 1].threshold : 100
    return Math.min(100, Math.max(0, ((pctPaid - cur) / (next - cur)) * 100))
  }
  const numVal = typeof value === 'number' ? value : 0
  if (level === -1) {
    return Math.min(100, (numVal / track.levels[0].threshold) * 100)
  }
  const cur = track.levels[level].threshold
  const next = level < 5 ? track.levels[level + 1].threshold : cur
  if (next <= cur) return 100
  return Math.min(100, Math.max(0, ((numVal - cur) / (next - cur)) * 100))
}

function getToNextLabel(track, level, value) {
  if (level >= 5) return null
  if (track.id === 'planner') return getLevelRequirement(track, level + 1)
  if (track.id === 'debt') {
    const pctPaid = value?.pctPaid ?? 0
    const next = track.levels[Math.min(level + 1, 5)].threshold
    if (next <= 0) return null
    const diff = next - pctPaid
    return diff > 0 ? `${diff.toFixed(0)}% more to go` : null
  }
  const numVal = typeof value === 'number' ? value : 0
  const nextThresh = track.levels[Math.min(level + 1, 5)].threshold
  return fmt(Math.max(0, nextThresh - numVal)) + ' to go'
}

function getTrackStats(track, value, data, prices, savingsRate, completedGoals, netWorth, usdToAud) {
  const monthlyExpenses = data.budget.expenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const monthlyIncome = data.budget.income.reduce((s, i) => s + (i.amount ?? 0), 0)

  if (track.id === 'saver') {
    const savingsAccounts = data.accounts.filter(a => !['Investment', 'Super', 'Crypto'].includes(a.type))
    const highest = savingsAccounts.reduce((m, a) => Math.max(m, a.balance ?? 0), 0)
    const monthsCovered = monthlyExpenses > 0 ? (value / monthlyExpenses).toFixed(1) : null
    return [
      { label: 'Months of Expenses', value: monthsCovered ? `${monthsCovered} mo` : '—' },
      { label: 'Highest Account', value: fmt(highest) },
      { label: 'Monthly Savings', value: fmt(monthlyIncome - monthlyExpenses) },
    ]
  }
  if (track.id === 'investor') {
    const stocksVal = data.stocks.reduce((s, st) => s + st.shares * (prices?.stocks?.[st.ticker]?.aud ?? 0), 0)
    const etfsVal = data.etfs.reduce((s, e) => s + e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0), 0)
    let bestStock = null, bestChange = -Infinity
    data.stocks.forEach(st => {
      const p = prices?.stocks?.[st.ticker]
      if (p?.change24h != null && p.change24h > bestChange) {
        bestChange = p.change24h
        bestStock = `${st.ticker} (${p.change24h >= 0 ? '+' : ''}${p.change24h.toFixed(2)}%)`
      }
    })
    return [
      { label: 'Stocks Value', value: fmt(stocksVal) },
      { label: 'ETF Value', value: fmt(etfsVal) },
      { label: 'Best Stock (24h)', value: bestStock ?? '—' },
    ]
  }
  if (track.id === 'crypto') {
    const coinsHeld = data.crypto.filter(c => c.amount > 0).length
    let largestSym = null, largestVal = 0
    let bestCoin = null, bestChange = -Infinity
    data.crypto.forEach(c => {
      const val = c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0)
      if (val > largestVal) { largestVal = val; largestSym = c.symbol }
      const ch = prices?.crypto?.[c.coinId]?.usd_24h_change
      if (ch != null && ch > bestChange) { bestChange = ch; bestCoin = `${c.symbol} (${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%)` }
    })
    return [
      { label: 'Coins Held', value: `${coinsHeld}` },
      { label: 'Largest Holding', value: largestSym ? `${largestSym} · ${fmt(largestVal)}` : '—' },
      { label: 'Best Performer (24h)', value: bestCoin ?? '—' },
    ]
  }
  if (track.id === 'planner') {
    return [
      { label: 'Savings Rate', value: savingsRate > 0 ? `${savingsRate.toFixed(1)}%` : '—' },
      { label: 'Goals Created', value: `${data.goals.length}` },
      { label: 'Goals Completed', value: `${completedGoals}` },
    ]
  }
  if (track.id === 'builder') {
    const superBal = typeof value === 'number' ? value : 0
    const projected = superBal * Math.pow(1.07, 10)
    const monthlyContrib = monthlyIncome * 0.11
    return [
      { label: 'Super Balance', value: fmt(superBal) },
      { label: 'Est. Contrib. (11%/mo)', value: fmt(monthlyContrib) },
      { label: 'Projected in 10yr (7%)', value: fmt(projected) },
    ]
  }
  if (track.id === 'debt') {
    const debts = data.debts ?? []
    const totalOrig = debts.reduce((s, d) => s + (d.originalAmount || 0), 0)
    const totalRemain = debts.reduce((s, d) => s + (d.remaining || 0), 0)
    const monthlyPmt = debts.reduce((s, d) => s + (d.monthlyPayment || 0), 0)
    const paidOff = Math.max(0, totalOrig - totalRemain)
    const monthsLeft = monthlyPmt > 0 ? Math.ceil(totalRemain / monthlyPmt) : null
    let payoffDate = '—'
    if (monthsLeft != null && monthsLeft > 0) {
      const d = new Date()
      d.setMonth(d.getMonth() + monthsLeft)
      payoffDate = d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    } else if (totalRemain === 0 && totalOrig > 0) {
      payoffDate = 'Done!'
    }
    return [
      { label: 'Total Debt', value: fmt(totalOrig) },
      { label: 'Remaining', value: fmt(totalRemain) },
      { label: 'Monthly Payments', value: fmt(monthlyPmt) },
      { label: 'Est. Payoff', value: payoffDate },
      { label: 'Paid Off', value: fmt(paidOff) },
    ]
  }
  return []
}

function TrackDetailModal({ track, level, value, data, prices, savingsRate, completedGoals, netWorth, usdToAud, onClose }) {
  const { color, levels, icon } = track
  const currentName = level >= 0 ? levels[level].name : (track.id === 'debt' ? 'No debt entered' : 'Not started')
  const isMaxed = level >= levels.length - 1
  const toNext = isMaxed ? null : getToNextLabel(track, level, value)
  const stats = getTrackStats(track, value, data, prices, savingsRate, completedGoals, netWorth, usdToAud)
  const motivational = MOTIVATIONAL[track.id]?.[Math.max(0, level)] ?? ''

  const displayValue = track.id === 'debt'
    ? (value?.pctPaid != null ? `${value.pctPaid.toFixed(1)}% paid off` : null)
    : track.id === 'planner' ? null
    : (typeof value === 'number' ? fmt(value) : null)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl modal-animate" style={{ borderTop: `3px solid ${color}` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `${color}18`, border: `1.5px solid ${color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>{icon}</div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 800 }}>{track.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: `${color}20`, color,
                }}>{currentName}</span>
                {displayValue && <span style={{ fontSize: 13, fontWeight: 700, color }}>{displayValue}</span>}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: 18, color: 'var(--muted)', flexShrink: 0 }}>✕</button>
        </div>

        {/* Level roadmap */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 12 }}>Level Roadmap</div>
          {levels.map((lv, idx) => {
            const isAchieved = level >= 0 && idx < level
            const isCurrent = level === idx || (level === -1 && idx === 0 && track.id !== 'debt')
            const isFuture = !isAchieved && !isCurrent
            const barPct = getRowBarPct(track, idx, level, value)
            const req = getLevelRequirement(track, idx)

            return (
              <div key={idx} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: idx < levels.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: isFuture ? 0.45 : 1,
              }}>
                {/* Circle */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isAchieved ? `${color}20` : isCurrent ? `${color}15` : 'var(--surface2)',
                  border: `2px solid ${isAchieved || isCurrent ? color : 'var(--border)'}`,
                  fontSize: isAchieved ? 13 : 11,
                  color: isAchieved || isCurrent ? color : 'var(--muted)',
                  fontWeight: 700, marginTop: 1,
                }}>
                  {isAchieved ? '✓' : idx + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: isCurrent ? color : isAchieved ? 'var(--text)' : 'var(--muted)',
                    }}>{lv.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                      color: isAchieved ? 'var(--green)' : isCurrent ? color : 'var(--muted)',
                    }}>
                      {isAchieved ? '✓ Achieved' : isCurrent && isMaxed ? 'MAX' : isCurrent && toNext ? toNext : req}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: (isAchieved || isCurrent) ? 6 : 0 }}>{req}</div>
                  {(isAchieved || isCurrent) && (
                    <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%', width: `${barPct}%`,
                        background: color, borderRadius: 2,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Track stats */}
        {stats.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 12 }}>Track Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational */}
        <div style={{
          background: `${color}10`, border: `1px solid ${color}25`,
          borderRadius: 10, padding: '14px 16px',
          fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic',
        }}>
          "{motivational}"
        </div>
      </div>
    </div>
  )
}

function TrackCard({ track, value, level, onClick }) {
  const { color, levels } = track
  const isMaxed = level >= levels.length - 1
  const currentName = level >= 0 ? levels[level].name : (track.id === 'debt' ? 'No debt' : 'Not started')
  const nextLevel = level < levels.length - 1 ? levels[level + 1] : null

  let barPct = 0
  let toNext = null
  if (track.id === 'planner') {
    barPct = level >= 0 ? ((level + 1) / levels.length) * 100 : (1 / levels.length) * 100
    toNext = nextLevel ? getLevelRequirement(track, level + 1) : null
  } else if (track.id === 'debt') {
    const pctPaid = value?.pctPaid ?? 0
    barPct = pctPaid
    if (!isMaxed && nextLevel) {
      const nextT = nextLevel.threshold
      toNext = pctPaid < nextT ? `${(nextT - pctPaid).toFixed(0)}% more` : null
    }
  } else {
    const numVal = typeof value === 'number' ? value : 0
    const prevThresh = level >= 0 ? levels[level].threshold : 0
    const nextThresh = nextLevel ? nextLevel.threshold : levels[levels.length - 1].threshold
    barPct = level < 0 ? 0 : isMaxed ? 100 : Math.min(100, ((numVal - prevThresh) / (nextThresh - prevThresh)) * 100)
    if (nextLevel && !isMaxed) toNext = fmt(Math.max(0, nextThresh - numVal)) + ' to go'
  }

  const displayValue = track.id === 'debt'
    ? (value?.pctPaid != null ? `${value.pctPaid.toFixed(1)}% paid` : '—')
    : track.id === 'planner' ? null
    : fmt(typeof value === 'number' ? value : 0)

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        borderTop: `3px solid ${color}`, padding: '16px 18px',
        cursor: 'pointer', transition: 'transform 0.12s, box-shadow 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}20` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{track.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{track.desc}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {displayValue && <div style={{ fontSize: 13, fontWeight: 700, color }}>{displayValue}</div>}
          <div style={{
            fontSize: 11, fontWeight: 600,
            background: `${color}20`, color,
            padding: '2px 8px', borderRadius: 20, marginTop: 2, whiteSpace: 'nowrap',
          }}>{currentName}</div>
        </div>
      </div>
      <div className="progress-bar" style={{ height: 5, marginBottom: 6 }}>
        <div className="progress-fill" style={{ width: `${Math.max(0, barPct)}%`, background: color }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
        {isMaxed
          ? <span style={{ color }}>MAX LEVEL</span>
          : toNext || (level < 0 ? 'Add data to begin' : 'Keep going')}
      </div>
    </div>
  )
}

export function VaultRank({ data, prices, netWorth }) {
  const [selectedTrack, setSelectedTrack] = useState(null)
  const usdToAud = prices?.usdToAud ?? 1.55
  const debts = data.debts ?? []

  const saverValue = useMemo(() =>
    data.accounts
      .filter(a => !['Investment', 'Super', 'Crypto'].includes(a.type))
      .reduce((s, a) => s + (a.currency === 'USD' ? (a.balance ?? 0) * usdToAud : (a.balance ?? 0)), 0),
    [data.accounts, usdToAud]
  )
  const investorValue = useMemo(() => {
    const stocks = data.stocks.reduce((s, st) => s + st.shares * (prices?.stocks?.[st.ticker]?.aud ?? 0), 0)
    const etfs = data.etfs.reduce((s, e) => s + e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0), 0)
    return stocks + etfs
  }, [data.stocks, data.etfs, prices])
  const cryptoValue = useMemo(() =>
    data.crypto.reduce((s, c) => s + c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0), 0),
    [data.crypto, prices]
  )
  const superValue = useMemo(() =>
    data.accounts.filter(a => a.type === 'Super').reduce((s, a) => s + (a.balance ?? 0), 0),
    [data.accounts]
  )

  const totalIncome = data.budget.income.reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalExpenses = data.budget.expenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  const completedGoals = data.goals.filter(g => g.current >= g.target).length

  const debtTotalOrig = debts.reduce((s, d) => s + (d.originalAmount || 0), 0)
  const debtTotalRemain = debts.reduce((s, d) => s + (d.remaining || 0), 0)
  const debtPctPaid = debtTotalOrig > 0 ? Math.min(100, ((debtTotalOrig - debtTotalRemain) / debtTotalOrig) * 100) : 0
  const debtValue = { totalOrig: debtTotalOrig, pctPaid: debtPctPaid }

  const trackValues = {
    saver: saverValue, investor: investorValue, crypto: cryptoValue,
    planner: null, builder: superValue, debt: debtValue,
  }

  // Two-pass: non-planner first, then planner uses those results
  const nonPlannerLevels = {}
  TRACKS.forEach(t => {
    if (t.id !== 'planner') {
      nonPlannerLevels[t.id] = computeTrackLevel(t, trackValues[t.id], data, savingsRate, completedGoals, netWorth, debts, null)
    }
  })
  // For Master Planner: debt -1 (no debt) counts as satisfied
  const otherLevelsForPlanner = TRACKS
    .filter(t => t.id !== 'planner')
    .map(t => nonPlannerLevels[t.id] < 0 ? 5 : nonPlannerLevels[t.id])

  const trackLevels = TRACKS.map(t => {
    if (t.id === 'planner') {
      return computeTrackLevel(t, null, data, savingsRate, completedGoals, netWorth, debts, otherLevelsForPlanner)
    }
    return nonPlannerLevels[t.id]
  })

  const activeLevels = trackLevels.map((l, i) => {
    if (TRACKS[i].id === 'debt' && l < 0) return 0
    return Math.max(0, l + 1)
  })
  const avgLevel = activeLevels.reduce((s, l) => s + l, 0) / activeLevels.length
  const allFiveOrAbove = trackLevels.every(l => l >= 4)

  let rankIdx = 0
  for (let i = OVERALL_RANKS.length - 1; i >= 0; i--) {
    const r = OVERALL_RANKS[i]
    if (r.requireAllFive) {
      if (allFiveOrAbove && netWorth >= r.minNW) { rankIdx = i; break }
      continue
    }
    if (avgLevel >= r.minAvg && netWorth >= r.minNW) { rankIdx = i; break }
  }

  const rank = OVERALL_RANKS[rankIdx]
  const nextRank = OVERALL_RANKS[rankIdx + 1] ?? null
  const GRADE_COLORS = { F: '#6b7280', D: '#e05b5b', C: '#f0a500', B: '#5b9ef0', A: '#4caf7d', S: '#a87ef0' }
  const gradeColor = GRADE_COLORS[rank.grade]

  let progressToNext = null
  if (nextRank) {
    const nwNeeded = nextRank.minNW > netWorth ? fmt(nextRank.minNW - netWorth) + ' net worth' : null
    const lvlNeeded = nextRank.minAvg > avgLevel ? `avg level ${nextRank.minAvg.toFixed(0)}` : null
    progressToNext = [nwNeeded, lvlNeeded].filter(Boolean).join(' + ') || 'Almost there'
  }

  const selectedIdx = selectedTrack != null ? TRACKS.findIndex(t => t.id === selectedTrack) : -1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero rank card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #16181f 0%, #12141a 100%)',
        border: `1px solid ${gradeColor}30`,
        padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          fontSize: 110, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900,
          color: `${gradeColor}12`, lineHeight: 1, userSelect: 'none',
        }}>{rank.grade}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 14,
            background: `${gradeColor}18`, border: `2px solid ${gradeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900,
            fontSize: 38, color: gradeColor, flexShrink: 0,
          }}>{rank.grade}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: 4 }}>Vault Rank</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 800, color: gradeColor, lineHeight: 1.1 }}>{rank.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{RANK_MESSAGES[rank.grade]}</div>
            {progressToNext && nextRank && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Next rank <span style={{ color: GRADE_COLORS[nextRank.grade], fontWeight: 700 }}>{nextRank.grade} — {nextRank.title}</span>
                {' '}· needs {progressToNext}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Avg Level</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: gradeColor }}>{avgLevel.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>out of 6</div>
          </div>
        </div>
      </div>

      {/* Track cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {TRACKS.map((track, i) => (
          <TrackCard
            key={track.id}
            track={track}
            value={trackValues[track.id]}
            level={trackLevels[i]}
            onClick={() => setSelectedTrack(track.id)}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedTrack && selectedIdx >= 0 && (
        <TrackDetailModal
          track={TRACKS[selectedIdx]}
          level={trackLevels[selectedIdx]}
          value={trackValues[TRACKS[selectedIdx].id]}
          data={data}
          prices={prices}
          savingsRate={savingsRate}
          completedGoals={completedGoals}
          netWorth={netWorth}
          usdToAud={usdToAud}
          onClose={() => setSelectedTrack(null)}
        />
      )}
    </div>
  )
}
