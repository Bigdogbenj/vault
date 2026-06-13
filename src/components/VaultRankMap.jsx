import { useState } from 'react'

const RANK_DATA = {
  F: {
    color: '#888', name: 'Broke Boy', sub: 'The starting line. Pure chaos. Survive.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $0+',       p: 5  },
      { n: 'The Investor', v: 'No positions yet',        p: 0  },
      { n: 'Crypto Degen', v: 'Not yet initiated',       p: 0  },
      { n: 'The Planner',  v: 'Using Vault',             p: 20 },
      { n: 'The Builder',  v: 'Any super balance',       p: 8  },
      { n: 'Debt Slayer',  v: 'Debt entered in app',     p: 12 },
    ],
    bonus: [
      { icon: '🗑️', title: 'Trash Collector', desc: 'Note every debt you own, no matter how small.' },
      { icon: '🍜', title: 'Ramen Budget',     desc: 'Set a food budget under $200/mo and stick to it.' },
      { icon: '💸', title: 'First $50 Saved',  desc: "Put $50 aside and don't touch it for 30 days." },
    ],
  },
  D: {
    color: '#c084fc', name: 'Scraping By', sub: 'Foundations forming. Keep the lights on.',
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
    ],
  },
  C: {
    color: '#38bdf8', name: 'Getting There', sub: 'Momentum is building. This is real now.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $10,000+',                 p: 55 },
      { n: 'The Investor', v: 'Stocks/ETFs: $7,500+',                   p: 50 },
      { n: 'Crypto Degen', v: 'Crypto: $6,000+',                        p: 48 },
      { n: 'The Planner',  v: '1 goal completed OR 10% savings rate',   p: 55 },
      { n: 'The Builder',  v: 'Super: $25,000+',                        p: 45 },
      { n: 'Debt Slayer',  v: '25% of total debt paid',                 p: 35 },
    ],
    bonus: [
      { icon: '📈', title: 'Compound Witness', desc: 'Hold an ETF position for 12 consecutive months.' },
      { icon: '🎯', title: 'Budget Sniper',    desc: 'Hit your monthly budget exactly (±2%) for 3 months.' },
      { icon: '🤝', title: 'Referral Bonus',   desc: 'Get a friend to open an investment account.' },
    ],
  },
  B: {
    color: '#34d399', name: 'Wealth Aware', sub: 'You know the game. Now compound it hard.',
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
    ],
  },
  A: {
    color: '#fb923c', name: 'Wealth Builder', sub: 'Serious numbers. The vault is in sight.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $35,000+',                p: 85 },
      { n: 'The Investor', v: 'Stocks/ETFs: $35,000+',                 p: 82 },
      { n: 'Crypto Degen', v: 'Crypto: $30,000+',                      p: 80 },
      { n: 'The Planner',  v: '3 goals completed + 20%+ savings rate', p: 85 },
      { n: 'The Builder',  v: 'Super: $150,000+',                      p: 78 },
      { n: 'Debt Slayer',  v: '75% of total debt paid',                p: 72 },
    ],
    bonus: [
      { icon: '💎', title: 'Diamond Hands', desc: 'Hold BTC or ETH through a 40%+ drawdown without selling.' },
      { icon: '🌍', title: 'Diversified',   desc: 'Hold assets across 4+ different asset classes simultaneously.' },
      { icon: '📊', title: '100K Portfolio',desc: 'Hit $100,000 total invested (crypto + stocks + ETFs).' },
    ],
  },
  S: {
    color: '#fbbf24', name: 'The Vault', sub: '$300,000+ net worth. All tracks maxed. Legendary.',
    tracks: [
      { n: 'The Saver',    v: 'Bank balance: $50,000+',       p: 100 },
      { n: 'The Investor', v: 'Stocks/ETFs: $75,000+',        p: 100 },
      { n: 'Crypto Degen', v: 'Crypto: $75,000+',             p: 100 },
      { n: 'The Planner',  v: 'Master Planner: savings 30%+', p: 100 },
      { n: 'The Builder',  v: 'Super: $250,000+',             p: 100 },
      { n: 'Debt Slayer',  v: 'Completely debt free 🎉',      p: 100 },
    ],
    bonus: [
      { icon: '👑', title: 'PLATINUM: Unlock The Vault', desc: 'Hit $1,000,000 liquid net worth.' },
      { icon: '🏦', title: 'The 1%',                    desc: 'Net worth exceeds 99% of Australians your age.' },
      { icon: '🚀', title: 'FIRE Achieved',             desc: 'Passive income covers 100% of your expenses.' },
    ],
  },
}

const WAYPOINTS = {
  F: { x: 90,  y: 515 },
  D: { x: 530, y: 515 },
  C: { x: 530, y: 355 },
  B: { x: 90,  y: 355 },
  A: { x: 90,  y: 165 },
  S: { x: 530, y: 145 },
}
const RANK_ORDER = ['F', 'D', 'C', 'B', 'A', 'S']

const RANK_NAMES = { F: 'Broke Boy', D: 'Scraping By', C: 'Getting There', B: 'Wealth Aware', A: 'Wealth Builder', S: 'The Vault' }

function lerp(a, b, t) { return a + (b - a) * t }

function getCharPos(currentRank, rankProgress) {
  const idx = RANK_ORDER.indexOf(currentRank)
  if (idx < 0) return WAYPOINTS.F
  if (idx >= RANK_ORDER.length - 1) return WAYPOINTS.S
  const from = WAYPOINTS[RANK_ORDER[idx]]
  const to = WAYPOINTS[RANK_ORDER[idx + 1]]
  return { x: lerp(from.x, to.x, rankProgress), y: lerp(from.y, to.y, rankProgress) }
}

function RankPanel({ grade, onClose, tracks }) {
  const rd = RANK_DATA[grade]
  if (!rd) return null
  const color = rd.color

  const mergedTracks = rd.tracks.map((t, i) => {
    const live = tracks?.[i]
    return { ...t, p: live?.pct ?? t.p }
  })
  const allDone = mergedTracks.every(t => t.p >= 100) && rd.bonus.every((_, i) => mergedTracks[i]?.p >= 100)

  return (
    <div style={{
      marginTop: 16, borderRadius: 12, border: `1px solid ${color}40`,
      background: 'var(--surface)', padding: '24px 20px', position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'var(--surface2)', border: '1px solid var(--border)',
        color: 'var(--muted)', borderRadius: 8, padding: '4px 10px',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>✕</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 28,
          color, lineHeight: 1, flexShrink: 0,
          textShadow: `0 0 12px ${color}60`,
        }}>{grade}</div>
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 800, color }}>{rd.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{rd.sub}</div>
        </div>
      </div>

      {/* Track grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {mergedTracks.map((t, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{t.n}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4 }}>{t.v}</div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min(100, t.p)}%`,
                background: t.p >= 100 ? '#34d399' : color,
                transition: 'width 0.4s',
              }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{Math.min(100, Math.round(t.p))}%</div>
          </div>
        ))}
      </div>

      {/* Bonus achievements */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 10 }}>Bonus Achievements</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: allDone ? 16 : 0 }}>
        {rd.bonus.map((b, i) => {
          const unlocked = (mergedTracks[i]?.p ?? 0) >= 100
          return (
            <div key={i} style={{
              background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px',
              border: unlocked ? `1px solid ${color}30` : '1px solid var(--border)',
              opacity: unlocked ? 1 : 0.5,
              filter: unlocked ? 'none' : 'grayscale(1)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{unlocked ? b.icon : '🔒'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{unlocked ? b.title : '???'}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>{unlocked ? b.desc : '???'}</div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div style={{
          textAlign: 'center', padding: '10px 16px', borderRadius: 8,
          background: `${color}15`, border: `1px solid ${color}40`,
          fontWeight: 700, fontSize: 12, color,
          letterSpacing: 1,
        }}>★ 100% COMPLETE — RANK MASTERED ★</div>
      )}
    </div>
  )
}

export function VaultRankMap({ currentRank, rankProgress, tracks }) {
  const [selectedRank, setSelectedRank] = useState(null)
  const charPos = getCharPos(currentRank, rankProgress)

  const handleBuilding = (grade) => {
    setSelectedRank(prev => prev === grade ? null : grade)
  }

  const rankColors = { F: '#888', D: '#c084fc', C: '#38bdf8', B: '#34d399', A: '#fb923c', S: '#fbbf24' }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ borderRadius: 12, overflow: 'hidden' }}>
        <svg
          viewBox="0 0 660 560"
          width="100%"
          style={{ display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Road surface gradient */}
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a2c10" />
              <stop offset="100%" stopColor="#887038" />
            </linearGradient>
            {/* Sky gradients */}
            <linearGradient id="skyDay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5eb8f0" />
              <stop offset="100%" stopColor="#2a8ad4" />
            </linearGradient>
            <linearGradient id="skyMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#142248" />
              <stop offset="100%" stopColor="#0f1830" />
            </linearGradient>
            <linearGradient id="skyNight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f0d28" />
              <stop offset="100%" stopColor="#0a0918" />
            </linearGradient>
            {/* Grass gradients */}
            <linearGradient id="grassTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a8020" />
              <stop offset="100%" stopColor="#386018" />
            </linearGradient>
            <linearGradient id="grassMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a4a14" />
              <stop offset="100%" stopColor="#1e3410" />
            </linearGradient>
            <linearGradient id="grassBot" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a2a0e" />
              <stop offset="100%" stopColor="#111a08" />
            </linearGradient>
            {/* Pool gradient */}
            <linearGradient id="poolWater" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60c8f8" />
              <stop offset="100%" stopColor="#1880c0" />
            </linearGradient>
            {/* Dome gradient */}
            <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d4aa30" />
              <stop offset="100%" stopColor="#886820" />
            </linearGradient>
            {/* Vault wall gradient */}
            <linearGradient id="vaultWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a2510" />
              <stop offset="100%" stopColor="#1a1808" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="sunGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── SKY BANDS ── */}
          <rect x="0" y="0"   width="660" height="210" fill="url(#skyDay)" />
          <rect x="0" y="210" width="660" height="180" fill="url(#skyMid)" />
          <rect x="0" y="390" width="660" height="170" fill="url(#skyNight)" />

          {/* ── GRASS BANDS ── */}
          <rect x="0" y="100" width="660" height="85" fill="url(#grassTop)" />
          <rect x="0" y="100" width="660" height="3" fill="#5a9828" />
          <rect x="0" y="185" width="660" height="85" fill="#2a4a14" fillOpacity="0.55" />
          <rect x="0" y="268" width="660" height="90" fill="url(#grassMid)" />
          <rect x="0" y="268" width="660" height="3" fill="#3a6818" />
          <rect x="0" y="358" width="660" height="115" fill="#182808" fillOpacity="0.65" />
          <rect x="0" y="470" width="660" height="90" fill="url(#grassBot)" />
          <rect x="0" y="470" width="660" height="3" fill="#1e3010" />

          {/* ── STARS ── */}
          {[
            [38,420],[80,445],[135,410],[190,430],[240,415],[290,440],[350,425],[400,412],
            [455,438],[510,418],[560,442],[610,428],[645,410],[620,455],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 1.5 : 1} fill="white">
              <animate attributeName="opacity" values="0.1;0.85;0.1" dur={`${2 + (i * 0.4) % 3}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 2}s`} />
            </circle>
          ))}

          {/* Moon */}
          <circle cx="48" cy="490" r="20" fill="#fffde0" />
          <circle cx="56" cy="483" r="17" fill="#0a0918" />

          {/* ── SUN ── */}
          <circle cx="580" cy="55" r="28" fill="#fef08a" fillOpacity="0.25" filter="url(#sunGlow)" />
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 580 55" to="360 580 55" dur="16s" repeatCount="indefinite" />
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const x1 = 580 + Math.cos(angle) * 32
              const y1 = 55 + Math.sin(angle) * 32
              const x2 = 580 + Math.cos(angle) * 40
              const y2 = 55 + Math.sin(angle) * 40
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
            })}
          </g>
          <circle cx="580" cy="55" r="22" fill="#fef08a" />
          <circle cx="580" cy="55" r="18" fill="#fde047" />

          {/* ── CLOUDS ── */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 9,0; 0,0" dur="5s" repeatCount="indefinite" />
            <ellipse cx="120" cy="45" rx="40" ry="16" fill="white" fillOpacity="0.85" />
            <ellipse cx="148" cy="38" rx="28" ry="14" fill="white" fillOpacity="0.9" />
            <ellipse cx="96" cy="42" rx="24" ry="12" fill="white" fillOpacity="0.8" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 9,0; 0,0" dur="7s" repeatCount="indefinite" />
            <ellipse cx="340" cy="28" rx="36" ry="14" fill="white" fillOpacity="0.75" />
            <ellipse cx="368" cy="22" rx="25" ry="12" fill="white" fillOpacity="0.8" />
            <ellipse cx="318" cy="26" rx="22" ry="11" fill="white" fillOpacity="0.7" />
          </g>

          {/* ── HELICOPTER ── */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="255,62; 263,57; 255,62" dur="5s" repeatCount="indefinite" />
            {/* fuselage */}
            <ellipse cx="0" cy="0" rx="18" ry="8" fill="#c8a840" />
            {/* nose */}
            <ellipse cx="16" cy="1" rx="6" ry="5" fill="#b89030" />
            {/* cockpit window */}
            <rect x="6" y="-5" width="10" height="7" rx="2" fill="#80d0f0" fillOpacity="0.8" />
            {/* tail boom */}
            <line x1="-18" y1="0" x2="-34" y2="-4" stroke="#a88020" strokeWidth="3" strokeLinecap="round" />
            {/* tail rotor */}
            <line x1="-34" y1="-8" x2="-34" y2="0" stroke="#c8a840" strokeWidth="2" strokeLinecap="round" />
            {/* rotor shaft */}
            <rect x="-2" y="-10" width="4" height="6" fill="#a88020" />
            {/* main rotor */}
            <line x1="-28" y1="-8" x2="28" y2="-8" stroke="#c8a840" strokeWidth="2.5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 0 -8" to="360 0 -8" dur="0.3s" repeatCount="indefinite" />
            </line>
            {/* skids */}
            <line x1="-14" y1="8" x2="-14" y2="13" stroke="#886820" strokeWidth="2" />
            <line x1="6" y1="8" x2="6" y2="13" stroke="#886820" strokeWidth="2" />
            <line x1="-18" y1="13" x2="10" y2="13" stroke="#886820" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ── ROAD PATHS ── */}
          {/* Shadow */}
          <path d="M 90,515 L 530,515 Q 572,515 572,472 L 572,355 Q 572,313 530,313 L 90,313 Q 48,313 48,270 L 48,165 Q 48,123 90,123 L 530,123"
            stroke="#0d0a04" strokeWidth="44" strokeOpacity="0.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Surface */}
          <path d="M 90,515 L 530,515 Q 572,515 572,472 L 572,355 Q 572,313 530,313 L 90,313 Q 48,313 48,270 L 48,165 Q 48,123 90,123 L 530,123"
            stroke="url(#roadGrad)" strokeWidth="32" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dashes */}
          <path d="M 90,515 L 530,515 Q 572,515 572,472 L 572,355 Q 572,313 530,313 L 90,313 Q 48,313 48,270 L 48,165 Q 48,123 90,123 L 530,123"
            stroke="#d4aa4a" strokeWidth="2" strokeDasharray="14 9" strokeOpacity="0.22" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* ══════════════════════════════════════
               ROAD ATMOSPHERE DETAILS
          ══════════════════════════════════════ */}

          {/* F→D bottom road: rubbish bags, dead sticks, cracks */}
          <ellipse cx="160" cy="508" rx="9" ry="6" fill="#2a3018" />
          <ellipse cx="163" cy="502" rx="6" ry="4" fill="#222818" />
          <ellipse cx="270" cy="522" rx="9" ry="6" fill="#2a3018" />
          <ellipse cx="273" cy="516" rx="6" ry="4" fill="#222818" />
          <ellipse cx="390" cy="508" rx="9" ry="6" fill="#2a3018" />
          <ellipse cx="393" cy="502" rx="6" ry="4" fill="#222818" />
          {/* dead sticks */}
          <line x1="200" y1="505" x2="196" y2="495" stroke="#3a3010" strokeWidth="1.5" />
          <line x1="200" y1="505" x2="204" y2="493" stroke="#3a3010" strokeWidth="1.5" />
          <line x1="200" y1="505" x2="207" y2="498" stroke="#3a3010" strokeWidth="1.5" />
          <line x1="440" y1="505" x2="436" y2="495" stroke="#3a3010" strokeWidth="1.5" />
          <line x1="440" y1="505" x2="444" y2="493" stroke="#3a3010" strokeWidth="1.5" />
          <line x1="440" y1="505" x2="447" y2="498" stroke="#3a3010" strokeWidth="1.5" />
          {/* cracks */}
          <path d="M 330,510 l 5,-3 l 3,4 l 4,-2" stroke="#1a1208" strokeWidth="1" fill="none" />
          <path d="M 480,518 l 4,-4 l 2,3 l 5,-3" stroke="#1a1208" strokeWidth="1" fill="none" />

          {/* D→C right connector: weeds */}
          <line x1="564" y1="470" x2="558" y2="460" stroke="#3a5010" strokeWidth="1.5" />
          <line x1="564" y1="470" x2="568" y2="459" stroke="#3a5010" strokeWidth="1.5" />
          <line x1="580" y1="438" x2="574" y2="428" stroke="#3a5010" strokeWidth="1.5" />
          <line x1="580" y1="438" x2="584" y2="427" stroke="#3a5010" strokeWidth="1.5" />
          <line x1="564" y1="400" x2="558" y2="390" stroke="#3a5010" strokeWidth="1.5" />
          <line x1="564" y1="400" x2="568" y2="389" stroke="#3a5010" strokeWidth="1.5" />
          <ellipse cx="560" cy="475" rx="7" ry="4" fill="#283810" />
          <ellipse cx="576" cy="443" rx="6" ry="3.5" fill="#283810" />
          <ellipse cx="560" cy="405" rx="7" ry="4" fill="#283810" />

          {/* C→B middle road: trees, flowers, lamp posts, birds */}
          {/* trees */}
          <rect x="157" y="340" width="6" height="14" fill="#5a3a10" />
          <circle cx="160" cy="335" r="13" fill="#2a5a10" />
          <rect x="247" y="340" width="6" height="14" fill="#5a3a10" />
          <circle cx="250" cy="335" r="13" fill="#2a5a10" />
          <rect x="337" y="340" width="6" height="14" fill="#5a3a10" />
          <circle cx="340" cy="335" r="13" fill="#2a5a10" />
          <rect x="427" y="340" width="6" height="14" fill="#5a3a10" />
          <circle cx="430" cy="335" r="13" fill="#2a5a10" />
          {/* flower clusters */}
          <ellipse cx="185" cy="352" rx="10" ry="4" fill="#3a6010" />
          <circle cx="181" cy="348" r="3" fill="#f08060" />
          <circle cx="186" cy="346" r="3" fill="#f0c040" />
          <circle cx="191" cy="349" r="3" fill="#f08060" />
          <ellipse cx="365" cy="352" rx="10" ry="4" fill="#3a6010" />
          <circle cx="361" cy="348" r="3" fill="#80c0f0" />
          <circle cx="366" cy="346" r="3" fill="#f0c040" />
          <circle cx="371" cy="349" r="3" fill="#80c0f0" />
          {/* lamp posts */}
          <rect x="209" y="330" width="4" height="22" fill="#c8a840" />
          <ellipse cx="211" cy="329" rx="7" ry="4" fill="#d4b850" />
          <circle cx="211" cy="328" r="6" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
          <rect x="399" y="330" width="4" height="22" fill="#c8a840" />
          <ellipse cx="401" cy="329" rx="7" ry="4" fill="#d4b850" />
          <circle cx="401" cy="328" r="6" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
          {/* animated birds */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="220,310; 260,295; 300,310" dur="6s" repeatCount="indefinite" />
            <path d="M -6,0 Q 0,-4 6,0" stroke="#1a2840" strokeWidth="1.5" fill="none" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="380,300; 340,288; 300,300" dur="8s" repeatCount="indefinite" />
            <path d="M -5,0 Q 0,-3 5,0" stroke="#1a2840" strokeWidth="1.5" fill="none" />
          </g>

          {/* B→A left connector: lamp posts, hedges, car */}
          {/* ornate lamp posts */}
          <rect x="40" y="240" width="4" height="28" fill="#c8a840" />
          <ellipse cx="42" cy="239" rx="8" ry="4" fill="#d4b850" />
          <circle cx="42" cy="238" r="7" fill="#ffe080" fillOpacity="0.12" filter="url(#glow)" />
          <rect x="56" y="290" width="4" height="28" fill="#c8a840" />
          <ellipse cx="58" cy="289" rx="8" ry="4" fill="#d4b850" />
          <circle cx="58" cy="288" r="7" fill="#ffe080" fillOpacity="0.12" filter="url(#glow)" />
          {/* hedges */}
          <rect x="30" y="252" width="20" height="8" rx="4" fill="#2a5a10" />
          <rect x="30" y="262" width="20" height="8" rx="4" fill="#2a5a10" />
          <rect x="50" y="302" width="20" height="8" rx="4" fill="#2a5a10" />
          <rect x="50" y="312" width="20" height="8" rx="4" fill="#2a5a10" />
          {/* sleek car */}
          <rect x="30" y="275" width="36" height="10" rx="3" fill="#304080" />
          <rect x="34" y="268" width="26" height="10" rx="3" fill="#405090" />
          <rect x="37" y="270" width="8" height="7" rx="1" fill="#80a8d0" fillOpacity="0.8" />
          <rect x="49" y="270" width="8" height="7" rx="1" fill="#80a8d0" fillOpacity="0.8" />
          <circle cx="37" cy="285" r="4" fill="#1a1a1a" /><circle cx="37" cy="285" r="2" fill="#555" />
          <circle cx="59" cy="285" r="4" fill="#1a1a1a" /><circle cx="59" cy="285" r="2" fill="#555" />

          {/* A→S top road: palms, coins, sports car */}
          {/* palm trees */}
          <rect x="185" y="110" width="6" height="20" fill="#8a6030" />
          <path d="M 188,110 Q 168,98 158,104" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 188,110 Q 175,95 185,88" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 188,110 Q 200,97 210,104" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="375" y="110" width="6" height="20" fill="#8a6030" />
          <path d="M 378,110 Q 358,98 348,104" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 378,110 Q 365,95 375,88" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 378,110 Q 390,97 400,104" stroke="#3a7820" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* coin stacks */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="1.8s" repeatCount="indefinite" begin="0s" />
            <ellipse cx="240" cy="116" rx="8" ry="3" fill="#c8a820" />
            <rect x="232" y="110" width="16" height="7" fill="#d4b830" />
            <ellipse cx="240" cy="110" rx="8" ry="3" fill="#e0c840" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
            <ellipse cx="310" cy="116" rx="8" ry="3" fill="#c8a820" />
            <rect x="302" y="110" width="16" height="7" fill="#d4b830" />
            <ellipse cx="310" cy="110" rx="8" ry="3" fill="#e0c840" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="1.8s" repeatCount="indefinite" begin="1.2s" />
            <ellipse cx="430" cy="116" rx="8" ry="3" fill="#c8a820" />
            <rect x="422" y="110" width="16" height="7" fill="#d4b830" />
            <ellipse cx="430" cy="110" rx="8" ry="3" fill="#e0c840" />
          </g>
          {/* sports car */}
          <rect x="336" y="126" width="46" height="12" rx="3" fill="#a02820" />
          <rect x="342" y="118" width="32" height="11" rx="3" fill="#c03030" />
          <rect x="346" y="120" width="10" height="8" rx="1" fill="#80c0e0" fillOpacity="0.8" />
          <rect x="360" y="120" width="10" height="8" rx="1" fill="#80c0e0" fillOpacity="0.8" />
          <circle cx="343" cy="138" r="4" fill="#1a1a1a" /><circle cx="343" cy="138" r="2" fill="#555" />
          <circle cx="375" cy="138" r="4" fill="#1a1a1a" /><circle cx="375" cy="138" r="2" fill="#555" />

          {/* ── POOL ── */}
          <rect x="310" y="146" width="60" height="34" rx="8" fill="#40a8e8" fillOpacity="0.3" stroke="#40a8e8" strokeWidth="1.5" />
          <rect x="314" y="150" width="52" height="26" rx="6" fill="url(#poolWater)" />
          <path d="M 318,158 Q 330,154 342,158 Q 354,162 366,158" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.5" />
          <path d="M 320,166 Q 332,162 344,166 Q 356,170 364,166" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.3" />
          <rect x="310" y="144" width="60" height="5" rx="2" fill="#60b8e8" fillOpacity="0.6" />
          <rect x="310" y="175" width="60" height="5" rx="2" fill="#60b8e8" fillOpacity="0.6" />

          {/* ══════════════════════════════════════
               BUILDINGS
          ══════════════════════════════════════ */}

          {/* ── F: SHACK at (90,515) ── */}
          <g transform="translate(90,515)" onClick={() => handleBuilding('F')} style={{ cursor: 'pointer' }}>
            {/* body */}
            <polygon points="-28,0 -28,-32 28,-32 28,0" fill="#3a2810" stroke="#2a1808" strokeWidth="1" />
            {/* roof */}
            <polygon points="-32,-32 0,-52 32,-32" fill="#5a2010" stroke="#3a1408" strokeWidth="1" />
            {/* chimney */}
            <rect x="12" y="-58" width="7" height="14" fill="#4a2810" />
            {/* smoke */}
            <ellipse cx="15" cy="-62" rx="4" ry="3" fill="#555" fillOpacity="0.5">
              <animateTransform attributeName="transform" type="translate" values="0,0; -2,-12; -2,-20" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="17" cy="-64" rx="3" ry="2.5" fill="#666" fillOpacity="0.4">
              <animateTransform attributeName="transform" type="translate" values="0,0; 1,-15; 1,-22" dur="2.4s" repeatCount="indefinite" begin="0.3s" />
            </ellipse>
            <ellipse cx="13" cy="-60" rx="3.5" ry="2.5" fill="#555" fillOpacity="0.35">
              <animateTransform attributeName="transform" type="translate" values="0,0; -3,-18; -3,-24" dur="2.8s" repeatCount="indefinite" begin="0.7s" />
            </ellipse>
            {/* cracked window */}
            <rect x="-20" y="-28" width="12" height="10" rx="1" fill="#4a6020" stroke="#2a1808" strokeWidth="0.5" />
            <line x1="-18" y1="-26" x2="-12" y2="-20" stroke="#2a1808" strokeWidth="0.7" />
            {/* door */}
            <rect x="6" y="-20" width="10" height="20" rx="1" fill="#2a1808" />
            {/* wall stubs */}
            <rect x="-28" y="-8" width="6" height="8" fill="#2a1808" />
            <rect x="22" y="-8" width="6" height="8" fill="#2a1808" />
            {/* debris */}
            <ellipse cx="-18" cy="-2" rx="5" ry="2" fill="#2a2010" />
            <ellipse cx="15" cy="-1" rx="4" ry="1.5" fill="#2a2010" />
            {/* weeds */}
            <line x1="-10" y1="0" x2="-12" y2="-7" stroke="#3a5010" strokeWidth="1.5" />
            <line x1="-8" y1="0" x2="-6" y2="-8" stroke="#3a5010" strokeWidth="1.5" />
            {/* grade label */}
            <text x="0" y="16" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#888">F</text>
            <text x="0" y="28" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#666">Broke Boy</text>
          </g>

          {/* ── D: RUNDOWN HOUSE at (530,515) ── */}
          <g transform="translate(530,515)" onClick={() => handleBuilding('D')} style={{ cursor: 'pointer' }}>
            {/* body */}
            <rect x="-30" y="-48" width="60" height="48" fill="#3c3020" stroke="#2a2010" strokeWidth="1" />
            {/* roof */}
            <polygon points="-34,-48 0,-72 34,-48" fill="#4a2810" stroke="#3a1c08" strokeWidth="1" />
            {/* chimney */}
            <rect x="14" y="-80" width="8" height="16" fill="#3a2410" />
            {/* cracked windows */}
            <rect x="-24" y="-40" width="14" height="12" rx="1" fill="#4a6020" stroke="#2a2010" strokeWidth="0.5" />
            <line x1="-22" y1="-38" x2="-14" y2="-30" stroke="#2a2010" strokeWidth="0.7" />
            <rect x="10" y="-40" width="14" height="12" rx="1" fill="#4a6020" stroke="#2a2010" strokeWidth="0.5" />
            <line x1="12" y1="-38" x2="20" y2="-30" stroke="#2a2010" strokeWidth="0.7" />
            {/* door */}
            <rect x="-6" y="-24" width="12" height="24" rx="1" fill="#2a1808" />
            {/* broken fences */}
            <line x1="-34" y1="-12" x2="-34" y2="-24" stroke="#3a2810" strokeWidth="2" />
            <line x1="-40" y1="-10" x2="-40" y2="-22" stroke="#3a2810" strokeWidth="2" />
            <line x1="-46" y1="-8" x2="-46" y2="-18" stroke="#3a2810" strokeWidth="2" />
            <line x1="34" y1="-12" x2="34" y2="-24" stroke="#3a2810" strokeWidth="2" />
            <line x1="40" y1="-10" x2="40" y2="-22" stroke="#3a2810" strokeWidth="2" />
            <line x1="46" y1="-8" x2="46" y2="-18" stroke="#3a2810" strokeWidth="2" />
            {/* weeds */}
            <line x1="-20" y1="0" x2="-22" y2="-8" stroke="#3a5010" strokeWidth="1.5" />
            <line x1="-18" y1="0" x2="-16" y2="-9" stroke="#3a5010" strokeWidth="1.5" />
            <line x1="18" y1="0" x2="16" y2="-9" stroke="#3a5010" strokeWidth="1.5" />
            {/* grade label */}
            <text x="0" y="16" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#c084fc">D</text>
            <text x="0" y="28" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#9060c0">Scraping By</text>
          </g>

          {/* ── C: SUBURBAN at (530,355) ── */}
          <g transform="translate(530,355)" onClick={() => handleBuilding('C')} style={{ cursor: 'pointer' }}>
            {/* body */}
            <rect x="-32" y="-50" width="64" height="50" fill="#5a6040" stroke="#3a4030" strokeWidth="1" />
            <rect x="-30" y="-48" width="60" height="46" fill="#6a7050" fillOpacity="0.3" />
            {/* roof */}
            <polygon points="-36,-50 0,-74 36,-50" fill="#6a4828" stroke="#4a3018" strokeWidth="1" />
            {/* chimney */}
            <rect x="14" y="-82" width="8" height="16" fill="#5a3820" />
            {/* lit windows */}
            <rect x="-26" y="-42" width="14" height="12" rx="1" fill="#ffd070" fillOpacity="0.9" stroke="#3a4030" strokeWidth="0.5" />
            <rect x="-24" y="-40" width="5" height="10" fill="#e8b840" fillOpacity="0.4" />
            <rect x="12" y="-42" width="14" height="12" rx="1" fill="#ffd070" fillOpacity="0.9" stroke="#3a4030" strokeWidth="0.5" />
            <rect x="14" y="-40" width="5" height="10" fill="#e8b840" fillOpacity="0.4" />
            {/* door */}
            <rect x="-7" y="-28" width="14" height="28" rx="1" fill="#4a3018" />
            <circle cx="5" cy="-14" r="2" fill="#c8a830" />
            {/* picket fence */}
            {[-48,-40,-32].map((fx, i) => <rect key={i} x={fx} y="-18" width="5" height="16" rx="1" fill="white" fillOpacity="0.7" />)}
            <rect x="-50" y="-14" width="24" height="2" fill="white" fillOpacity="0.5" />
            {[30,38,46].map((fx, i) => <rect key={i} x={fx} y="-18" width="5" height="16" rx="1" fill="white" fillOpacity="0.7" />)}
            <rect x="28" y="-14" width="24" height="2" fill="white" fillOpacity="0.5" />
            {/* small tree */}
            <rect x="-52" y="-32" width="4" height="14" fill="#5a3a10" />
            <circle cx="-50" cy="-36" r="9" fill="#3a6820" />
            {/* flowers */}
            <ellipse cx="44" cy="-2" rx="8" ry="4" fill="#3a6010" />
            <circle cx="40" cy="-5" r="2.5" fill="#f08060" />
            <circle cx="45" cy="-7" r="2.5" fill="#f0c040" />
            <circle cx="50" cy="-5" r="2.5" fill="#f08060" />
            {/* grade label */}
            <text x="0" y="16" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#38bdf8">C</text>
            <text x="0" y="28" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#2090c0">Getting There</text>
          </g>

          {/* ── B: 2-STORY at (90,355) ── */}
          <g transform="translate(90,355)" onClick={() => handleBuilding('B')} style={{ cursor: 'pointer' }}>
            {/* garage */}
            <rect x="-50" y="-36" width="32" height="36" fill="#5a6070" stroke="#3a4050" strokeWidth="1" />
            <rect x="-48" y="-34" width="28" height="10" rx="1" fill="#3a4050" />
            <rect x="-42" y="-34" width="8" height="10" rx="0" fill="#5a6070" />
            <circle cx="-34" cy="-28" r="2" fill="#c8a840" />
            {/* main house */}
            <rect x="-22" y="-70" width="72" height="70" fill="#6a7080" stroke="#4a5060" strokeWidth="1" />
            {/* siding lines */}
            {[-60,-50,-40,-30,-20,-10].map((sy, i) => <line key={i} x1="-22" y1={sy} x2="50" y2={sy} stroke="#5a6070" strokeWidth="0.5" />)}
            {/* roof spanning both */}
            <polygon points="-56,-70 25,-100 56,-70" fill="#7a5838" stroke="#5a3818" strokeWidth="1" />
            {/* chimneys */}
            <rect x="-6" y="-108" width="8" height="18" fill="#6a4828" />
            <rect x="26" y="-108" width="8" height="18" fill="#6a4828" />
            {/* upper windows */}
            {[-14, 2, 18, 34].map((wx, i) => (
              <rect key={i} x={wx} y="-62" width="12" height="14" rx="1" fill="#ffd070" fillOpacity="0.8" stroke="#4a5060" strokeWidth="0.5" />
            ))}
            {/* lower windows */}
            <rect x="-14" y="-38" width="14" height="14" rx="1" fill="#ffd070" fillOpacity="0.8" stroke="#4a5060" strokeWidth="0.5" />
            <rect x="36" y="-38" width="14" height="14" rx="1" fill="#ffd070" fillOpacity="0.8" stroke="#4a5060" strokeWidth="0.5" />
            {/* porch columns + beam */}
            <rect x="4" y="-0" width="4" height="-28" fill="#b0b8c0" />
            <rect x="18" y="-0" width="4" height="-28" fill="#b0b8c0" />
            <rect x="2" y="-28" width="24" height="4" fill="#b0b8c0" />
            {/* double door */}
            <rect x="4" y="-24" width="10" height="24" rx="1" fill="#4a3018" />
            <rect x="14" y="-24" width="10" height="24" rx="1" fill="#4a3018" />
            <circle cx="12" cy="-12" r="1.5" fill="#c8a840" />
            <circle cx="16" cy="-12" r="1.5" fill="#c8a840" />
            {/* driveway */}
            <polygon points="-50,0 -18,0 -12,14 -56,14" fill="#4a4840" />
            {/* lamp posts */}
            <rect x="-60" y="-30" width="3" height="28" fill="#c8a840" />
            <ellipse cx="-58" cy="-31" rx="6" ry="3" fill="#d4b850" />
            <circle cx="-58" cy="-32" r="5" fill="#ffe080" fillOpacity="0.12" filter="url(#glow)" />
            <rect x="57" y="-30" width="3" height="28" fill="#c8a840" />
            <ellipse cx="58" cy="-31" rx="6" ry="3" fill="#d4b850" />
            <circle cx="58" cy="-32" r="5" fill="#ffe080" fillOpacity="0.12" filter="url(#glow)" />
            {/* hedges */}
            <ellipse cx="-48" cy="-4" rx="8" ry="5" fill="#3a6020" />
            <ellipse cx="-36" cy="-4" rx="8" ry="5" fill="#3a6020" />
            <ellipse cx="46" cy="-4" rx="8" ry="5" fill="#3a6020" />
            <ellipse cx="58" cy="-4" rx="8" ry="5" fill="#3a6020" />
            {/* grade label */}
            <text x="14" y="20" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#34d399">B</text>
            <text x="14" y="32" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#259070">Wealth Aware</text>
          </g>

          {/* ── A: MANSION at (90,165) ── */}
          <g transform="translate(90,165)" onClick={() => handleBuilding('A')} style={{ cursor: 'pointer' }}>
            {/* gate posts */}
            <rect x="-72" y="-40" width="10" height="40" fill="#c8a840" stroke="#a88020" strokeWidth="1" />
            <rect x="62" y="-40" width="10" height="40" fill="#c8a840" stroke="#a88020" strokeWidth="1" />
            {/* iron rails */}
            {[-68,-60,-52].map((rx, i) => <line key={i} x1={rx} y1="0" x2={rx} y2="-32" stroke="#888" strokeWidth="2" />)}
            {[66,74,82].map((rx, i) => <line key={i} x1={rx} y1="0" x2={rx} y2="-32" stroke="#888" strokeWidth="2" />)}
            <line x1="-68" y1="-22" x2="-52" y2="-22" stroke="#888" strokeWidth="1.5" />
            <line x1="66" y1="-22" x2="82" y2="-22" stroke="#888" strokeWidth="1.5" />
            {/* topiary */}
            <rect x="-54" y="-28" width="6" height="10" fill="#5a3a10" />
            <circle cx="-51" cy="-33" r="10" fill="#2a6818" />
            <rect x="48" y="-28" width="6" height="10" fill="#5a3a10" />
            <circle cx="51" cy="-33" r="10" fill="#2a6818" />
            {/* ornate lamp posts */}
            <rect x="-44" y="-52" width="4" height="32" fill="#c8a840" />
            <ellipse cx="-42" cy="-53" rx="8" ry="4" fill="#d4b850" />
            <circle cx="-42" cy="-54" r="7" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
            <rect x="40" y="-52" width="4" height="32" fill="#c8a840" />
            <ellipse cx="42" cy="-53" rx="8" ry="4" fill="#d4b850" />
            <circle cx="42" cy="-54" r="7" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
            {/* side wings */}
            <rect x="-58" y="-70" width="28" height="50" fill="#8a8878" stroke="#6a6858" strokeWidth="1" />
            <polygon points="-62,-70 -44,-84 -26,-70" fill="#9a7858" stroke="#7a5838" strokeWidth="1" />
            <rect x="30" y="-70" width="28" height="50" fill="#8a8878" stroke="#6a6858" strokeWidth="1" />
            <polygon points="26,-70 44,-84 62,-70" fill="#9a7858" stroke="#7a5838" strokeWidth="1" />
            {/* main body */}
            <rect x="-30" y="-90" width="60" height="90" fill="#9a9888" stroke="#7a7868" strokeWidth="1" />
            {/* columns */}
            {[-24,-12,0,12,24].map((cx2, i) => (
              <rect key={i} x={cx2-3} y="-88" width="6" height="78" rx="2" fill="#b0aea0" />
            ))}
            {/* entablature */}
            <rect x="-32" y="-88" width="64" height="10" fill="#a8a698" />
            {/* main roof */}
            <polygon points="-34,-98 0,-118 34,-98" fill="#9a7858" stroke="#7a5838" strokeWidth="1" />
            {/* dormers */}
            <polygon points="-20,-98 -12,-110 -4,-98" fill="#9a7858" />
            <rect x="-18" y="-108" width="14" height="10" fill="#8a7848" />
            <polygon points="4,-98 12,-110 20,-98" fill="#9a7858" />
            <rect x="6" y="-108" width="14" height="10" fill="#8a7848" />
            {/* chimneys */}
            <rect x="-22" y="-122" width="7" height="16" fill="#8a6840" />
            <rect x="15" y="-122" width="7" height="16" fill="#8a6840" />
            {/* windows upper */}
            {[-22, -8, 6, 20].map((wx, i) => (
              <rect key={i} x={wx} y="-80" width="11" height="15" rx="2" fill="#ffd070" fillOpacity="0.85" stroke="#6a6858" strokeWidth="0.5" />
            ))}
            {/* windows lower */}
            {[-22, 11].map((wx, i) => (
              <rect key={i} x={wx} y="-56" width="13" height="20" rx="2" fill="#ffd070" fillOpacity="0.85" stroke="#6a6858" strokeWidth="0.5" />
            ))}
            {/* wing windows */}
            <rect x="-52" y="-60" width="14" height="14" rx="2" fill="#ffd070" fillOpacity="0.8" stroke="#6a6858" strokeWidth="0.5" />
            <rect x="38" y="-60" width="14" height="14" rx="2" fill="#ffd070" fillOpacity="0.8" stroke="#6a6858" strokeWidth="0.5" />
            {/* grand arched door */}
            <rect x="-10" y="-40" width="20" height="40" rx="2" fill="#5a3a18" />
            <path d="M -10,-40 Q 0,-52 10,-40" fill="#5a3a18" />
            <line x1="0" y1="-40" x2="0" y2="0" stroke="#3a2010" strokeWidth="1" />
            <circle cx="-4" cy="-20" r="2" fill="#c8a840" />
            <circle cx="4" cy="-20" r="2" fill="#c8a840" />
            {/* steps */}
            <rect x="-16" y="-4" width="32" height="5" fill="#b0aea0" />
            <rect x="-12" y="1" width="24" height="5" fill="#a8a698" />
            {/* fountain */}
            <ellipse cx="0" cy="14" rx="22" ry="8" fill="#40a8e8" fillOpacity="0.4" stroke="#40a8e8" strokeWidth="1" />
            <ellipse cx="0" cy="14" rx="10" ry="4" fill="#60c8f8" fillOpacity="0.6" />
            {/* bright lawn */}
            <ellipse cx="0" cy="16" rx="60" ry="10" fill="#4a9820" fillOpacity="0.3" />
            {/* grade label */}
            <text x="0" y="30" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#fb923c">A</text>
            <text x="0" y="42" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#c07030">Wealth Builder</text>
          </g>

          {/* ── S: VAULT at (530,145) ── */}
          <g transform="translate(530,145)" onClick={() => handleBuilding('S')} style={{ cursor: 'pointer' }}>
            {/* hill */}
            <ellipse cx="0" cy="10" rx="90" ry="28" fill="#3a5818" />
            <path d="M -90,10 Q 0,-20 90,10 L 90,18 Q 0,-10 -90,18 Z" fill="#4a6820" />
            {/* base/steps */}
            <rect x="-52" y="-12" width="104" height="12" fill="#b0a888" />
            <rect x="-46" y="-22" width="92" height="12" fill="#c0b898" />
            {/* pillasters */}
            {[-38,-22,-6,6,22,38].map((px, i) => (
              <rect key={i} x={px-4} y="-90" width="8" height="68" rx="1" fill="#c8c0a8" />
            ))}
            {/* vault wall */}
            <rect x="-46" y="-90" width="92" height="68" fill="url(#vaultWall)" />
            {/* entablature + pediment */}
            <rect x="-50" y="-95" width="100" height="12" fill="#b8b0a0" />
            <polygon points="-50,-95 0,-125 50,-95" fill="#c8c0b0" stroke="#a8a090" strokeWidth="1" />
            <polygon points="-38,-95 0,-118 38,-95" fill="none" stroke="#a8a090" strokeWidth="0.8" />
            {/* VAULT text */}
            <text x="0" y="-100" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="7" fill="#d4b840">VAULT</text>
            {/* dome */}
            <ellipse cx="0" cy="-90" rx="28" ry="14" fill="url(#domeGrad)" />
            <ellipse cx="0" cy="-90" rx="22" ry="10" fill="#c8a830" />
            <ellipse cx="-6" cy="-94" rx="8" ry="4" fill="#e0c050" fillOpacity="0.5" />
            {/* spire */}
            <line x1="0" y1="-104" x2="0" y2="-118" stroke="#c8a840" strokeWidth="2" />
            <circle cx="0" cy="-120" r="4" fill="#d4b840" />
            {/* pulsing glow */}
            <circle cx="0" cy="-120" r="8" fill="#fbbf24" fillOpacity="0.2">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* circular vault door */}
            <circle cx="0" cy="-50" r="22" fill="#1a1808" stroke="#c8a840" strokeWidth="2" />
            <circle cx="0" cy="-50" r="16" fill="none" stroke="#a88820" strokeWidth="1.5" />
            <circle cx="0" cy="-50" r="8" fill="none" stroke="#886810" strokeWidth="1.5" />
            {/* spokes */}
            {[0, 90, 180, 270].map((ang, i) => {
              const rad = ang * Math.PI / 180
              return <line key={i} x1={Math.cos(rad)*8} y1={-50 + Math.sin(rad)*8} x2={Math.cos(rad)*22} y2={-50 + Math.sin(rad)*22} stroke="#c8a840" strokeWidth="1.5" />
            })}
            {/* ambient glow */}
            <ellipse cx="0" cy="8" rx="70" ry="14" fill="#fbbf24" fillOpacity="0.06" />
            {/* gold lamp posts */}
            <rect x="-62" y="-52" width="4" height="40" fill="#c8a840" />
            <ellipse cx="-60" cy="-53" rx="8" ry="4" fill="#d4b850" />
            <circle cx="-60" cy="-54" r="7" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
            <rect x="58" y="-52" width="4" height="40" fill="#c8a840" />
            <ellipse cx="60" cy="-53" rx="8" ry="4" fill="#d4b850" />
            <circle cx="60" cy="-54" r="7" fill="#ffe080" fillOpacity="0.15" filter="url(#glow)" />
            {/* sparkles */}
            {[[-70,-80],[-45,-110],[70,-80],[45,-110],[-20,-125],[20,-125]].map(([sx, sy], i) => (
              <circle key={i} cx={sx} cy={sy} r="3" fill="#fbbf24">
                <animate attributeName="opacity" values="0.1;0.9;0.1" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
                <animate attributeName="r" values="2;4;2" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
              </circle>
            ))}
            {/* bright lawn */}
            <ellipse cx="0" cy="12" rx="65" ry="12" fill="#5ab828" fillOpacity="0.3" />
            {/* grade label */}
            <text x="0" y="32" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill="#fbbf24">S</text>
            <text x="0" y="44" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fill="#c09010">The Vault</text>
          </g>

          {/* ── MILESTONE DOTS ── */}
          {Object.entries(WAYPOINTS).map(([grade, { x, y }]) => (
            <g key={grade} onClick={() => handleBuilding(grade)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={10} fill={rankColors[grade]} fillOpacity="0.15" stroke={rankColors[grade]} strokeWidth="1.5" />
              <circle cx={x} cy={y} r={7} fill={rankColors[grade]} stroke={rankColors[grade]} strokeWidth="1.5" />
            </g>
          ))}

          {/* ── CHARACTER ── */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`${charPos.x},${charPos.y}; ${charPos.x},${charPos.y - 4}; ${charPos.x},${charPos.y}`}
              dur="0.6s"
              repeatCount="indefinite"
            />
            {/* arrow */}
            <text x="0" y="-36" textAnchor="middle" fontSize="12" fill="#fbbf24">▼</text>
            <text x="0" y="-46" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="8" fontWeight="700" fill="#fbbf24">YOU</text>
            {/* legs */}
            <rect x="-5" y="-10" width="4" height="10" rx="1" fill="#304080" transform="rotate(-8 -3 -5)" />
            <rect x="1" y="-10" width="4" height="10" rx="1" fill="#304080" transform="rotate(8 3 -5)" />
            {/* boots */}
            <ellipse cx="-4" cy="1" rx="5" ry="3" fill="#1a1a1a" />
            <ellipse cx="4" cy="1" rx="5" ry="3" fill="#1a1a1a" />
            {/* body */}
            <rect x="-8" y="-28" width="16" height="20" rx="3" fill="#f0a500" />
            {/* arms */}
            <rect x="-14" y="-26" width="6" height="12" rx="2" fill="#e89400" transform="rotate(15 -11 -20)" />
            <rect x="8" y="-26" width="6" height="12" rx="2" fill="#e89400" transform="rotate(-15 11 -20)" />
            {/* backpack */}
            <rect x="7" y="-26" width="8" height="14" rx="2" fill="#6040a0" />
            {/* neck */}
            <rect x="-3" y="-32" width="6" height="6" rx="1" fill="#f8d0a0" />
            {/* head */}
            <circle cx="0" cy="-40" r="10" fill="#f8d0a0" />
            {/* hair */}
            <ellipse cx="0" cy="-48" rx="9" ry="5" fill="#2a1a08" />
            <rect x="-9" y="-50" width="18" height="6" rx="2" fill="#2a1a08" />
            {/* eyes */}
            <circle cx="-3" cy="-40" r="2" fill="white" />
            <circle cx="3" cy="-40" r="2" fill="white" />
            <circle cx="-3" cy="-40" r="1" fill="#1a1a1a" />
            <circle cx="3" cy="-40" r="1" fill="#1a1a1a" />
            <circle cx="-2.5" cy="-40.5" r="0.5" fill="white" />
            <circle cx="3.5" cy="-40.5" r="0.5" fill="white" />
            {/* smile */}
            <path d="M -3,-36 Q 0,-33 3,-36" stroke="#a06040" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* ── PANEL ── */}
      {selectedRank && (
        <RankPanel
          grade={selectedRank}
          onClose={() => setSelectedRank(null)}
          tracks={tracks}
        />
      )}
    </div>
  )
}
