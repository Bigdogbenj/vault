import { useState, useRef, useEffect } from 'react'

const RANK_ORDER = ['F', 'D', 'C', 'B', 'A', 'S']

const RANK_COLORS = {
  F: '#888', D: '#c084fc', C: '#38bdf8',
  B: '#34d399', A: '#fb923c', S: '#fbbf24',
}

const PRESTIGE_EMBLEMS = { F: '🗑️', D: '🪙', C: '🏠', B: '🏢', A: '🏆', S: '🏦' }

const RANK_DATA = {
  F: { name: 'Broke Boy', sub: 'Every legend starts somewhere. Make the first move.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $0+',        p: 5   },
      { n: 'The Investor', v: 'No positions yet',          p: 0   },
      { n: 'Crypto Degen', v: 'Not yet initiated',         p: 0   },
      { n: 'The Planner',  v: 'Using Vault',               p: 100 },
      { n: 'The Builder',  v: 'Any super balance',         p: 20  },
      { n: 'Debt Slayer',  v: 'Debt entered in app',       p: 30  },
    ],
    bonus: [
      { icon: '🗑️', title: 'Trash Collector', desc: 'Note every debt you own, no matter how small.' },
      { icon: '🍜', title: 'Ramen Budget',     desc: 'Set a food budget under $200/mo and stick to it.' },
      { icon: '💸', title: 'First $50 Saved',  desc: "Put $50 aside and don't touch it for 30 days." },
    ] },
  D: { name: 'Scraping By', sub: 'Foundations forming. Keep the lights on.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $5,000+',       p: 30 },
      { n: 'The Investor', v: 'Stocks/ETFs: $2,500+',        p: 25 },
      { n: 'Crypto Degen', v: 'Crypto: $2,500+',             p: 28 },
      { n: 'The Planner',  v: 'Budget set up with expenses', p: 35 },
      { n: 'The Builder',  v: 'Super: $10,000+',             p: 20 },
      { n: 'Debt Slayer',  v: '10% of total debt paid',      p: 15 },
    ],
    bonus: [
      { icon: '📵', title: 'No-Spend Week',   desc: 'Go 7 days buying only absolute necessities.' },
      { icon: '🔄', title: 'Round-Up Saver',  desc: 'Round up every purchase and bank the difference.' },
      { icon: '📞', title: 'Bill Negotiator', desc: 'Call one provider and negotiate a lower rate.' },
    ] },
  C: { name: 'Getting There', sub: 'Momentum is building. This is real now.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $10,000+',               p: 55 },
      { n: 'The Investor', v: 'Stocks/ETFs: $7,500+',                 p: 50 },
      { n: 'Crypto Degen', v: 'Crypto: $6,000+',                      p: 48 },
      { n: 'The Planner',  v: '1 goal completed OR 10% savings rate', p: 55 },
      { n: 'The Builder',  v: 'Super: $25,000+',                      p: 45 },
      { n: 'Debt Slayer',  v: '25% of total debt paid',               p: 35 },
    ],
    bonus: [
      { icon: '📈', title: 'Compound Witness', desc: 'Hold an ETF position for 12 consecutive months.' },
      { icon: '🎯', title: 'Budget Sniper',    desc: 'Hit your monthly budget exactly (±2%) for 3 months.' },
      { icon: '🤝', title: 'Referral Bonus',   desc: 'Get a friend to open an investment account.' },
    ] },
  B: { name: 'Wealth Aware', sub: 'You know the game. Now compound it hard.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $20,000+',       p: 72 },
      { n: 'The Investor', v: 'Stocks/ETFs: $15,000+',        p: 68 },
      { n: 'Crypto Degen', v: 'Crypto: $15,000+',             p: 65 },
      { n: 'The Planner',  v: 'Savings rate: 20%+ sustained', p: 70 },
      { n: 'The Builder',  v: 'Super: $50,000+',              p: 60 },
      { n: 'Debt Slayer',  v: '50% of total debt paid',       p: 55 },
    ],
    bonus: [
      { icon: '🏠', title: 'Asset Owner',   desc: 'Own at least one real asset.' },
      { icon: '🧾', title: 'Tax Optimizer', desc: 'Lodge a tax return and claim every legal deduction.' },
      { icon: '🤖', title: 'Auto Investor', desc: 'Set up an automatic recurring investment transfer.' },
    ] },
  A: { name: 'Wealth Builder', sub: 'Serious numbers. The vault is in sight.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $35,000+',          p: 85 },
      { n: 'The Investor', v: 'Stocks/ETFs: $35,000+',           p: 82 },
      { n: 'Crypto Degen', v: 'Crypto: $30,000+',                p: 80 },
      { n: 'The Planner',  v: '3 goals + 20%+ savings rate',     p: 85 },
      { n: 'The Builder',  v: 'Super: $150,000+',                p: 78 },
      { n: 'Debt Slayer',  v: '75% of total debt paid',          p: 72 },
    ],
    bonus: [
      { icon: '💎', title: 'Diamond Hands',  desc: 'Hold BTC or ETH through a 40%+ drawdown.' },
      { icon: '🌍', title: 'Diversified',    desc: 'Hold assets across 4+ different asset classes.' },
      { icon: '📊', title: '100K Portfolio', desc: 'Hit $100,000 total invested.' },
    ] },
  S: { name: 'The Vault', sub: '$300,000+ net worth. All tracks maxed. Legendary.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $50,000+',       p: 100 },
      { n: 'The Investor', v: 'Stocks/ETFs: $75,000+',        p: 100 },
      { n: 'Crypto Degen', v: 'Crypto: $75,000+',             p: 100 },
      { n: 'The Planner',  v: 'Master Planner: 30%+ savings', p: 100 },
      { n: 'The Builder',  v: 'Super: $250,000+',             p: 100 },
      { n: 'Debt Slayer',  v: 'Completely debt free 🎉',      p: 100 },
    ],
    bonus: [
      { icon: '👑', title: 'PLATINUM: Unlock The Vault', desc: 'Hit $1,000,000 liquid net worth.' },
      { icon: '🏦', title: 'The 1%',                    desc: 'Net worth exceeds 99% of Australians your age.' },
      { icon: '🚀', title: 'FIRE Achieved',             desc: 'Passive income covers 100% of expenses.' },
    ] },
}

const RANK_REQ_SHORT = {
  F: 'Starting rank',
  D: '$5K+ bank · Positive NW',
  C: '$10K+ · Goal done',
  B: '$20K+ · $30K NW',
  A: '$35K+ · $80K NW',
  S: '$300K NW · All 5+',
}

const NODES = {
  F: { x: 20, y: 930 },
  D: { x: 80, y: 760 },
  C: { x: 20, y: 590 },
  B: { x: 80, y: 420 },
  A: { x: 20, y: 250 },
  S: { x: 80, y: 80  },
}

const SEGMENTS = [
  { from: 'F', to: 'D', cx: 50, cy: 845, color: RANK_COLORS.D },
  { from: 'D', to: 'C', cx: 50, cy: 675, color: RANK_COLORS.C },
  { from: 'C', to: 'B', cx: 50, cy: 505, color: RANK_COLORS.B },
  { from: 'B', to: 'A', cx: 50, cy: 335, color: RANK_COLORS.A },
  { from: 'A', to: 'S', cx: 50, cy: 165, color: RANK_COLORS.S },
]

const fmt = (n) => {
  if (n == null || isNaN(n)) return '—'
  const abs = Math.abs(n)
  const str = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${Math.round(abs)}`
  return n < 0 ? `-${str}` : str
}

function Tile({ label, value, sub, color, labelSz = 8, valueSz = 14 }) {
  return (
    <div style={{
      background: `${color}0f`,
      border: `1px solid ${color}2e`,
      borderRadius: 10, padding: '7px 9px', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: labelSz, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color, opacity: 0.65, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: valueSz, fontWeight: 700, color, lineHeight: 1.2, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: Math.max(7, labelSz - 3), color, opacity: 0.5 }}>{sub}</div>
    </div>
  )
}

export function VaultRankMap({
  currentRank, rankProgress, tracks,
  netWorth, invested, debt, savingsRate, daysActive,
  liquidityMonths, attackPerMonth, defencePct, yieldPct,
  powerTotal, prestigeScore, debtRatio,
}) {
  const [selectedRank, setSelectedRank] = useState(currentRank)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight * 0.78
    }
  }, [])

  const currentIdx = RANK_ORDER.indexOf(currentRank)
  const nextRankGrade = RANK_ORDER[currentIdx + 1]
  const rankColor = RANK_COLORS[currentRank]
  const rd = RANK_DATA[currentRank]
  const prestigeLevel = currentIdx + 1

  function getSegProg(seg) {
    const toIdx = RANK_ORDER.indexOf(seg.to)
    const fromIdx = RANK_ORDER.indexOf(seg.from)
    if (toIdx <= currentIdx) return 1
    if (fromIdx === currentIdx) return rankProgress
    return 0
  }

  const activeSeg = SEGMENTS.find(s => s.from === currentRank)
  let dotPos = null
  if (activeSeg && rankProgress > 0) {
    const p0 = NODES[activeSeg.from]
    const p1 = { x: activeSeg.cx, y: activeSeg.cy }
    const p2 = NODES[activeSeg.to]
    const t = rankProgress
    dotPos = {
      x: (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x,
      y: (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y,
    }
  }

  function nodeState(grade) {
    const idx = RANK_ORDER.indexOf(grade)
    if (idx < currentIdx) return 'done'
    if (idx === currentIdx) return 'current'
    if (idx === currentIdx + 1) return 'next'
    return 'locked'
  }

  const selState = nodeState(selectedRank)
  const selColor = RANK_COLORS[selectedRank]
  const selRD = RANK_DATA[selectedRank]

  const mergedTracks = selRD.tracks.map((t, i) => {
    if (selectedRank === currentRank && tracks?.[i] != null)
      return { ...t, p: Math.min(100, Math.max(0, tracks[i].pct)) }
    if (selState === 'done') return { ...t, p: 100 }
    return t
  })
  const allDone = mergedTracks.every(t => t.p >= 100)

  function cardLabel() {
    if (selState === 'done') return '✓ Completed'
    if (selState === 'current') return 'Current rank'
    if (selState === 'next') return 'Next target'
    return `Rank ${selectedRank}`
  }

  const isFuture = selState === 'next' || selState === 'locked'

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── HEADER CARD ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, overflow: 'hidden', marginBottom: 10,
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 14, padding: '14px 16px', alignItems: 'flex-start' }}>
          {/* Pulsing badge — SVG-native animations only */}
          <svg width="42" height="42" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
            <circle cx="21" cy="21" r="16" fill="none" stroke={rankColor} strokeWidth="1.5" opacity="0">
              <animate attributeName="r" values="16;28;28" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="21" cy="21" r="16" fill="none" stroke={rankColor} strokeWidth="1" opacity="0">
              <animate attributeName="r" values="16;34;34" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
              <animate attributeName="opacity" values="0.3;0;0" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
            </circle>
            <circle cx="21" cy="21" r="16" fill={`${rankColor}1a`} stroke={rankColor} strokeWidth="2">
              <animate attributeName="stroke-opacity" values="0.45;1;0.45" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <text x="21" y="21" textAnchor="middle" dominantBaseline="middle"
              fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="13" fill="white">
              {currentRank}
            </text>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, color: rankColor, lineHeight: 1.1 }}>{rd.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, marginBottom: 10, lineHeight: 1.4 }}>{rd.sub}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                {nextRankGrade ? `Progress to Rank ${nextRankGrade}` : 'Maximum rank achieved'}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: nextRankGrade ? RANK_COLORS[nextRankGrade] : rankColor }}>
                {Math.round(rankProgress * 100)}%
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.round(rankProgress * 100)}%`,
                background: nextRankGrade
                  ? `linear-gradient(90deg, #7c3aed, ${RANK_COLORS[nextRankGrade]})`
                  : rankColor,
              }} />
            </div>
          </div>
        </div>
        {/* Prestige panel */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '12px 20px', gap: 2, flexShrink: 0,
        }}>
          <div style={{ fontSize: 20, lineHeight: 1 }}>{PRESTIGE_EMBLEMS[currentRank]}</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 900, color: rankColor, lineHeight: 1.1 }}>
            {prestigeLevel}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginTop: 2 }}>
            Prestige
          </div>
        </div>
      </div>

      {/* ── LEGEND ROW ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        {[
          { color: '#fbbf24', label: 'Core' },
          { color: '#4ade80', label: 'Offense' },
          { color: '#60a5fa', label: 'Utility' },
          { color: '#f87171', label: 'Defence' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── STATS + MAP ── */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>

        {/* LEFT COLUMN — Core + Utility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 130, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#fbbf24', marginBottom: 5 }}>Core</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Tile color="#fbbf24" label="Net Worth"    value={fmt(netWorth)}                 sub="net worth"       />
              <Tile color="#fbbf24" label="Savings Rate" value={`${Math.round(savingsRate)}%`} sub="income retained" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#60a5fa', marginBottom: 5, marginTop: 4 }}>Utility</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Tile color="#60a5fa" label="Liquidity" value={liquidityMonths != null ? `${liquidityMonths.toFixed(1)} mo` : '—'} sub="months runway" />
              <Tile color="#60a5fa" label="Prestige"  value={`${prestigeScore.toFixed(1)}/6`} sub="vault mastery"   />
            </div>
          </div>
        </div>

        {/* CENTRE — Scrollable map */}
        <div style={{ width: 200, flexShrink: 0, position: 'relative', height: 420 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', zIndex: 1, pointerEvents: 'none' }} />
          <div ref={scrollRef} style={{ height: '100%', width: '100%', overflowY: 'scroll', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <svg width="200" height="1100" viewBox="0 0 100 1100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="vrm-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Segments */}
              {SEGMENTS.map(seg => {
                const p0 = NODES[seg.from]
                const p2 = NODES[seg.to]
                const d = `M${p0.x},${p0.y} Q${seg.cx},${seg.cy} ${p2.x},${p2.y}`
                const prog = getSegProg(seg)
                return (
                  <g key={`${seg.from}-${seg.to}`}>
                    <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" strokeLinecap="round" />
                    {prog > 0 && (
                      <path d={d} fill="none" stroke={seg.color} strokeWidth="5" strokeLinecap="round"
                        pathLength="120" strokeDasharray="120" strokeDashoffset={120 * (1 - prog)} opacity="0.85" />
                    )}
                  </g>
                )
              })}

              {/* Progress dot on active segment */}
              {dotPos && (
                <g filter="url(#vrm-glow)">
                  <circle cx={dotPos.x} cy={dotPos.y} r="5" fill={rankColor} />
                  <circle cx={dotPos.x} cy={dotPos.y} r="2.5" fill="white" />
                </g>
              )}

              {/* Nodes */}
              {RANK_ORDER.map(grade => {
                const { x, y } = NODES[grade]
                const color = RANK_COLORS[grade]
                const state = nodeState(grade)
                const isSelected = selectedRank === grade
                const isLeft = x < 50
                const labelX = isLeft ? 37 : 63
                const anchor = isLeft ? 'start' : 'end'
                const nameOp = state === 'current' ? 0.9 : state === 'next' ? 0.55 : state === 'done' ? 0.45 : 0.22

                return (
                  <g key={grade} onClick={() => setSelectedRank(grade)} style={{ cursor: 'pointer' }}>
                    {state === 'current' && (
                      <>
                        <circle cx={x} cy={y} r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0">
                          <animate attributeName="r" values="14;22;22" dur="2.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.45;0;0" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r="14" fill="none" stroke={color} strokeWidth="1" opacity="0">
                          <animate attributeName="r" values="14;26;26" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
                          <animate attributeName="opacity" values="0.3;0;0" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
                        </circle>
                      </>
                    )}
                    {state === 'next' && (
                      <circle cx={x} cy={y} r="17" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
                    )}
                    {isSelected && state !== 'current' && (
                      <circle cx={x} cy={y} r="17" fill="none" stroke={color} strokeWidth="1.5"
                        strokeDasharray="4 3" opacity="0.5" />
                    )}
                    {state === 'done' && (
                      <circle cx={x} cy={y} r="14" fill={`${color}18`} stroke={`${color}60`} strokeWidth="1.5" />
                    )}
                    {state === 'current' && (
                      <circle cx={x} cy={y} r="14" fill="#1a1a1a" stroke={color} strokeWidth="2.5" filter="url(#vrm-glow)">
                        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {state === 'next' && (
                      <circle cx={x} cy={y} r="14" fill={`${color}12`} stroke={color} strokeWidth="1.5" opacity="0.6" />
                    )}
                    {state === 'locked' && (
                      <circle cx={x} cy={y} r="14" fill="#0a0a0a" stroke={`${color}20`} strokeWidth="1" />
                    )}
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="8" fill={color}
                      opacity={state === 'current' ? 1 : state === 'next' ? 0.55 : state === 'done' ? 0.5 : 0.18}>
                      {grade}
                    </text>
                    <text x={labelX} y={y - 8} textAnchor={anchor}
                      fontFamily="Space Grotesk, sans-serif" fontWeight="600" fontSize="11" fill={color} opacity={nameOp}>
                      {RANK_DATA[grade].name}
                    </text>
                    <text x={labelX} y={y + 8} textAnchor={anchor}
                      fontFamily="Space Grotesk, sans-serif" fontWeight="400" fontSize="9"
                      fill="rgba(255,255,255,0.45)" opacity={nameOp}>
                      {RANK_REQ_SHORT[grade]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN — Offense + Defence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 130, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#4ade80', marginBottom: 5 }}>Offense</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Tile color="#4ade80" label="Attack"   value={`${fmt(attackPerMonth)}/mo`} sub="monthly deploy"  />
              <Tile color="#4ade80" label="Power"    value={fmt(powerTotal)}             sub="total portfolio" />
              <Tile color="#4ade80" label="Invested" value={fmt(invested)}               sub="cost basis"      />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#f87171', marginBottom: 5, marginTop: 4 }}>Defence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Tile color="#f87171" label="Debt"       value={fmt(debt)}                    sub="total debt"     />
              <Tile color="#f87171" label="Defence"    value={`${Math.round(defencePct)}%`} sub="emergency fund" />
              <Tile color="#f87171" label="Debt Ratio" value={`${Math.round(debtRatio)}%`}  sub="debt vs assets" />
            </div>
          </div>
        </div>

      </div>
      </div>

      {/* ── DETAIL CARD ── */}
      <div style={{
        borderRadius: 14, marginTop: 10,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 16px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `${selColor}20`, border: `1.5px solid ${selColor}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 13,
            color: selColor, flexShrink: 0,
          }}>{selectedRank}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: selColor, opacity: 0.7, marginBottom: 1 }}>
              {cardLabel()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{selRD.name}</div>
          </div>
        </div>

        {/* Track 3-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginBottom: 10 }}>
          {mergedTracks.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9, padding: '5px 7px',
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 4 }}>{t.n}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3 }}>{t.v}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${Math.min(100, t.p)}%`,
                  background: t.p >= 100 ? '#4ade80' : selColor,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bonus achievements */}
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 8 }}>
          Bonus Achievements
        </div>

        {isFuture ? (
          <div style={{
            padding: '10px 12px', borderRadius: 9,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, color: 'var(--muted)', fontStyle: 'italic',
            marginBottom: selectedRank === currentRank && nextRankGrade ? 12 : 0,
          }}>
            🔒 3 hidden achievements — reach this rank to reveal
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7,
            marginBottom: selectedRank === currentRank && nextRankGrade ? 12 : 0,
          }}>
            {selRD.bonus.map((b, i) => (
              <div key={i} style={{
                background: allDone ? `${selColor}0a` : 'rgba(255,255,255,0.02)',
                border: allDone ? `1px solid ${selColor}25` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 9, padding: '9px 8px', textAlign: 'center',
                opacity: allDone ? 1 : 0.35,
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{allDone ? b.icon : '🔒'}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text)', marginBottom: 2, lineHeight: 1.3 }}>
                  {allDone ? b.title : '???'}
                </div>
                <div style={{ fontSize: 8, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {allDone ? b.desc : 'Complete tracks to reveal'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar to next rank */}
        {selectedRank === currentRank && nextRankGrade && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>
                Progress to Rank {nextRankGrade}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: RANK_COLORS[nextRankGrade] }}>
                {Math.round(rankProgress * 100)}%
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min(100, rankProgress * 100)}%`,
                background: `linear-gradient(90deg, #7c3aed, ${RANK_COLORS[nextRankGrade]})`,
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
