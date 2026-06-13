import { useState } from 'react'

const RANK_ORDER = ['F', 'D', 'C', 'B', 'A', 'S']

const RANK_COLORS = {
  F: '#888', D: '#c084fc', C: '#38bdf8',
  B: '#34d399', A: '#fb923c', S: '#fbbf24',
}

const NODES = {
  F: { x: 90,  y: 580 },
  D: { x: 250, y: 480 },
  C: { x: 90,  y: 380 },
  B: { x: 250, y: 280 },
  A: { x: 90,  y: 180 },
  S: { x: 250, y: 80  },
}

// Control points for each quadratic bezier segment
const SEGMENTS = [
  { from: 'F', to: 'D', cx: 170, cy: 530, color: '#888'    },
  { from: 'D', to: 'C', cx: 170, cy: 430, color: '#c084fc' },
  { from: 'C', to: 'B', cx: 170, cy: 330, color: '#38bdf8' },
  { from: 'B', to: 'A', cx: 170, cy: 230, color: '#34d399' },
  { from: 'A', to: 'S', cx: 170, cy: 130, color: '#fb923c' },
]

const RANK_DATA = {
  F: { color: '#888', name: 'Broke Boy', sub: 'The starting line. Pure chaos. Survive.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $0+',         p: 5   },
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
  D: { color: '#c084fc', name: 'Scraping By', sub: 'Foundations forming. Keep the lights on.',
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
  C: { color: '#38bdf8', name: 'Getting There', sub: 'Momentum is building. This is real now.',
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
  B: { color: '#34d399', name: 'Wealth Aware', sub: 'You know the game. Now compound it hard.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $20,000+',       p: 72 },
      { n: 'The Investor', v: 'Stocks/ETFs: $15,000+',        p: 68 },
      { n: 'Crypto Degen', v: 'Crypto: $15,000+',             p: 65 },
      { n: 'The Planner',  v: 'Savings rate: 20%+ sustained', p: 70 },
      { n: 'The Builder',  v: 'Super: $50,000+',              p: 60 },
      { n: 'Debt Slayer',  v: '50% of total debt paid',       p: 55 },
    ],
    bonus: [
      { icon: '🏠', title: 'Asset Owner',   desc: 'Own at least one real asset (property, vehicle, business).' },
      { icon: '🧾', title: 'Tax Optimizer', desc: 'Lodge a tax return and claim every legal deduction.' },
      { icon: '🤖', title: 'Auto Investor', desc: 'Set up an automatic recurring investment transfer.' },
    ] },
  A: { color: '#fb923c', name: 'Wealth Builder', sub: 'Serious numbers. The vault is in sight.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $35,000+',                p: 85 },
      { n: 'The Investor', v: 'Stocks/ETFs: $35,000+',                 p: 82 },
      { n: 'Crypto Degen', v: 'Crypto: $30,000+',                      p: 80 },
      { n: 'The Planner',  v: '3 goals completed + 20%+ savings rate', p: 85 },
      { n: 'The Builder',  v: 'Super: $150,000+',                      p: 78 },
      { n: 'Debt Slayer',  v: '75% of total debt paid',                p: 72 },
    ],
    bonus: [
      { icon: '💎', title: 'Diamond Hands',  desc: 'Hold BTC or ETH through a 40%+ drawdown without selling.' },
      { icon: '🌍', title: 'Diversified',    desc: 'Hold assets across 4+ different asset classes simultaneously.' },
      { icon: '📊', title: '100K Portfolio', desc: 'Hit $100,000 total invested (crypto + stocks + ETFs).' },
    ] },
  S: { color: '#fbbf24', name: 'The Vault', sub: '$300,000+ net worth. All tracks maxed. Legendary.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $50,000+',      p: 100 },
      { n: 'The Investor', v: 'Stocks/ETFs: $75,000+',       p: 100 },
      { n: 'Crypto Degen', v: 'Crypto: $75,000+',            p: 100 },
      { n: 'The Planner',  v: 'Master Planner: savings 30%+',p: 100 },
      { n: 'The Builder',  v: 'Super: $250,000+',            p: 100 },
      { n: 'Debt Slayer',  v: 'Completely debt free 🎉',     p: 100 },
    ],
    bonus: [
      { icon: '👑', title: 'PLATINUM: Unlock The Vault', desc: 'Hit $1,000,000 liquid net worth.' },
      { icon: '🏦', title: 'The 1%',                    desc: 'Net worth exceeds 99% of Australians your age.' },
      { icon: '🚀', title: 'FIRE Achieved',             desc: 'Passive income covers 100% of your expenses.' },
    ] },
}

const RANK_REQ_SHORT = {
  F: 'Starting rank',
  D: '$5K+ bank · Positive NW',
  C: '$10K+ bank · Goal done',
  B: '$20K+ bank · $30K NW',
  A: '$35K+ bank · $80K NW',
  S: '$300K NW · All tracks 5+',
}

function quadBezier(t, x0, y0, cx, cy, x2, y2) {
  const mt = 1 - t
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y2,
  }
}

function segPath(seg) {
  const p0 = NODES[seg.from]
  const p2 = NODES[seg.to]
  return `M${p0.x},${p0.y} Q${seg.cx},${seg.cy} ${p2.x},${p2.y}`
}

export function VaultRankMap({ currentRank, rankProgress, tracks }) {
  const [selectedRank, setSelectedRank] = useState(currentRank)

  const currentIdx = RANK_ORDER.indexOf(currentRank)

  // Compute segment progress for each segment
  function getSegmentProgress(seg) {
    const toIdx = RANK_ORDER.indexOf(seg.to)
    const fromIdx = RANK_ORDER.indexOf(seg.from)
    if (toIdx <= currentIdx) return 1          // completed
    if (fromIdx === currentIdx) return rankProgress  // active
    return 0                                        // future
  }

  // Current position dot on active segment
  const activeSeg = SEGMENTS.find(s => s.from === currentRank)
  let dotPos = null
  if (activeSeg) {
    const p0 = NODES[activeSeg.from]
    const p2 = NODES[activeSeg.to]
    dotPos = quadBezier(rankProgress, p0.x, p0.y, activeSeg.cx, activeSeg.cy, p2.x, p2.y)
  }

  // Node state
  function nodeState(grade) {
    const idx = RANK_ORDER.indexOf(grade)
    if (idx < currentIdx) return 'done'
    if (idx === currentIdx) return 'current'
    if (idx === currentIdx + 1) return 'next'
    return 'locked'
  }

  // Detail card data
  const selIdx = RANK_ORDER.indexOf(selectedRank)
  const selState = nodeState(selectedRank)
  const selRD = RANK_DATA[selectedRank]
  const selColor = RANK_COLORS[selectedRank]
  const nextRankGrade = RANK_ORDER[currentIdx + 1]

  // Merge live tracks into selected rank's track data
  const mergedTracks = selRD.tracks.map((t, i) => {
    if (selectedRank === currentRank && tracks?.[i] != null) {
      return { ...t, p: Math.min(100, Math.max(0, tracks[i].pct)) }
    }
    if (selState === 'done') return { ...t, p: 100 }
    return t
  })
  const allTracksDone = mergedTracks.every(t => t.p >= 100)

  // Label text helpers
  function labelLine2(grade) {
    const state = nodeState(grade)
    if (state === 'current') {
      const pct = Math.round(rankProgress * 100)
      const next = RANK_ORDER[currentIdx + 1]
      return next ? `You are here · ${pct}% to ${next}` : 'Maximum rank achieved'
    }
    if (state === 'next') return 'Next target'
    return RANK_REQ_SHORT[grade]
  }

  function labelOpacity(grade) {
    const state = nodeState(grade)
    if (state === 'current') return 0.7
    if (state === 'next') return 0.5
    return 0.28
  }

  function cardLabel() {
    if (selState === 'done') return '✓ Completed'
    if (selState === 'current') return 'Current rank'
    if (selState === 'next') return 'Next target'
    return `Rank ${selectedRank}`
  }

  const isFuture = selState === 'next' || selState === 'locked'

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '16px 12px 32px' }}>
      {/* ── SVG MAP ── */}
      <svg viewBox="0 0 340 640" width="100%" style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="vrm-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── SEGMENTS ── */}
        {SEGMENTS.map(seg => {
          const d = segPath(seg)
          const prog = getSegmentProgress(seg)
          const dashOffset = 220 * (1 - prog)
          return (
            <g key={`${seg.from}-${seg.to}`}>
              {/* base unlit */}
              <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"
                strokeLinecap="round" />
              {/* lit overlay */}
              <path d={d} fill="none" stroke={seg.color} strokeWidth="5"
                strokeLinecap="round"
                pathLength="220"
                strokeDasharray="220"
                strokeDashoffset={dashOffset}
                opacity="0.85"
              />
            </g>
          )
        })}

        {/* ── CURRENT POSITION DOT ── */}
        {dotPos && (
          <g filter="url(#vrm-glow)">
            <circle cx={dotPos.x} cy={dotPos.y} r="6" fill={RANK_COLORS[currentRank]} />
            <circle cx={dotPos.x} cy={dotPos.y} r="3" fill="white" />
          </g>
        )}

        {/* ── NODES ── */}
        {RANK_ORDER.map(grade => {
          const { x, y } = NODES[grade]
          const color = RANK_COLORS[grade]
          const state = nodeState(grade)
          const isLeft = x === 90
          const labelX = isLeft ? 128 : 212
          const anchor = isLeft ? 'start' : 'end'
          const rd = RANK_DATA[grade]
          const op = labelOpacity(grade)

          return (
            <g key={grade} onClick={() => setSelectedRank(grade)} style={{ cursor: 'pointer' }}>
              {/* Pulse rings for current */}
              {state === 'current' && (
                <>
                  <circle cx={x} cy={y} r="30" fill="none" stroke={color} strokeWidth="1.5" opacity="0">
                    <animate attributeName="r" values="30;48;48" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="30" fill="none" stroke={color} strokeWidth="1" opacity="0">
                    <animate attributeName="r" values="30;56;56" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
                    <animate attributeName="opacity" values="0.3;0;0" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
                  </circle>
                </>
              )}

              {/* Next rank outer ring */}
              {state === 'next' && (
                <circle cx={x} cy={y} r="36" fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
              )}

              {/* Main circle */}
              {state === 'done' && (
                <circle cx={x} cy={y} r="30" fill={`${color}15`} stroke={`${color}60`} strokeWidth="2" />
              )}
              {state === 'current' && (
                <>
                  <circle cx={x} cy={y} r="30" fill="#1e1e1e" stroke={color} strokeWidth="2.5" filter="url(#vrm-glow)">
                    <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {state === 'next' && (
                <circle cx={x} cy={y} r="30" fill={`${color}12`} stroke={color} strokeWidth="2" opacity="0.6" />
              )}
              {state === 'locked' && (
                <circle cx={x} cy={y} r="30" fill="#0a0a0a" stroke={`${color}18`} strokeWidth="1.5" />
              )}

              {/* Selected ring */}
              {selectedRank === grade && (
                <circle cx={x} cy={y} r="34" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              )}

              {/* Grade letter */}
              <text
                x={x} y={y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="18"
                fill={state === 'current' ? 'white' : color}
                opacity={state === 'done' ? 0.6 : state === 'current' ? 1 : state === 'next' ? 0.5 : 0.2}
              >{grade}</text>

              {/* Labels on opposite side */}
              <text
                x={labelX} y={y - 7}
                textAnchor={anchor}
                fontFamily="Space Grotesk, sans-serif" fontWeight="600" fontSize="12"
                fill={color} opacity={op}
              >{rd.name}</text>
              <text
                x={labelX} y={y + 9}
                textAnchor={anchor}
                fontFamily="Space Grotesk, sans-serif" fontWeight="400" fontSize="10"
                fill="rgba(255,255,255,0.45)" opacity={op / 0.7 * 0.6}
              >{labelLine2(grade)}</text>
            </g>
          )
        })}
      </svg>

      {/* ── DETAIL CARD ── */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        padding: 16,
      }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${selColor}18`, border: `2px solid ${selColor}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 16,
            color: selColor, flexShrink: 0,
          }}>{selectedRank}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: selColor, opacity: 0.7, marginBottom: 2 }}>
              {cardLabel()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{selRD.name}</div>
          </div>
        </div>

        {/* Track grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {mergedTracks.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9, padding: '8px 10px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 4 }}>{t.n}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{t.v}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${Math.min(100, t.p)}%`,
                  background: t.p >= 100 ? '#34d399' : selColor,
                  transition: 'width 0.4s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bonus achievements */}
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 10 }}>
          Bonus Achievements
        </div>

        {isFuture ? (
          <div style={{
            padding: '12px 14px', borderRadius: 9,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12, color: 'var(--muted)', fontStyle: 'italic',
          }}>
            🔒 3 hidden achievements — reach this rank to unlock
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: (selectedRank === currentRank && nextRankGrade) ? 16 : 0 }}>
            {selRD.bonus.map((b, i) => {
              const unlocked = allTracksDone
              return (
                <div key={i} style={{
                  background: unlocked ? `${selColor}08` : 'rgba(255,255,255,0.02)',
                  border: unlocked ? `1px solid ${selColor}25` : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 9, padding: '10px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 5 }}>{unlocked ? b.icon : '🔒'}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: unlocked ? 'var(--text)' : 'var(--muted)', marginBottom: 3, lineHeight: 1.3 }}>
                    {unlocked ? b.title : '???'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.4 }}>
                    {unlocked ? b.desc : 'Complete all tracks to reveal'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress bar to next rank */}
        {selectedRank === currentRank && nextRankGrade && (
          <div style={{ marginTop: isFuture ? 16 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>
                Progress to Rank {nextRankGrade}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: RANK_COLORS[nextRankGrade] }}>
                {Math.round(rankProgress * 100)}%
              </span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min(100, rankProgress * 100)}%`,
                background: `linear-gradient(90deg, #7c3aed, ${RANK_COLORS[nextRankGrade]})`,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
