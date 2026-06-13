import { useMemo, useState } from 'react'
import { VaultRank, useVaultRankInfo, RANK_MESSAGES } from '../components/VaultRank'
import { resolvedAccountBalance, fmt } from '../utils'
import { Modal } from '../components/Modal'

export function VaultRankPage({ data, updateData, prices }) {
  const totalDebt = (data.debts ?? []).reduce((s, d) => s + (d.remaining || 0), 0)
  const totalBalance = useMemo(
    () => data.accounts.reduce((s, a) => s + resolvedAccountBalance(a, data, prices), 0),
    [data, prices]
  )
  const trueNetWorth = totalBalance - totalDebt

  const {
    rank, gradeColor, avgLevel, nextRank, progressToNext, xpPct,
    saverValue, investorValue, cryptoValue, savingsRate, savings,
    totalExpenses, debtTotalRemain, investedCostBasis,
  } = useVaultRankInfo(data, prices, trueNetWorth)

  const superValue = useMemo(
    () => data.accounts.filter(a => a.type === 'Super').reduce((s, a) => s + (a.balance ?? 0), 0),
    [data.accounts]
  )
  const debtTotalOrig = (data.debts ?? []).reduce((s, d) => s + (d.originalAmount || 0), 0)
  const debtPctPaid = debtTotalOrig > 0
    ? Math.min(100, ((debtTotalOrig - debtTotalRemain) / debtTotalOrig) * 100)
    : 0
  const superBalance = data.accounts.find(a => a.type === 'Super')?.balance ?? 0
  const liquidNetWorth = totalBalance - superBalance

  const liquidityMonths = totalExpenses > 0 ? saverValue / totalExpenses : null
  const defencePct = totalExpenses > 0 ? Math.min(100, (saverValue / (totalExpenses * 6)) * 100) : 0
  const portfolioTotal = investorValue + cryptoValue

  const statSheet = [
    {
      name: 'LIQUIDITY',
      value: liquidityMonths != null ? `${liquidityMonths.toFixed(1)} mo` : '—',
      descriptor: 'months of runway',
      color: liquidityMonths == null ? 'var(--muted)' : liquidityMonths >= 3 ? 'var(--green)' : liquidityMonths >= 1 ? 'var(--amber)' : 'var(--red)',
    },
    {
      name: 'ATTACK',
      value: fmt(savings),
      descriptor: 'deployed per month',
      color: savings > 0 ? 'var(--green)' : savings < 0 ? 'var(--red)' : 'var(--muted)',
    },
    {
      name: 'DEFENCE',
      value: `${defencePct.toFixed(0)}%`,
      descriptor: 'of 6-month emergency fund',
      color: defencePct >= 100 ? 'var(--green)' : defencePct >= 50 ? 'var(--amber)' : 'var(--red)',
    },
    {
      name: 'YIELD',
      value: `${savingsRate.toFixed(0)}%`,
      descriptor: 'income retained',
      color: savingsRate >= 20 ? 'var(--green)' : savingsRate >= 10 ? 'var(--amber)' : 'var(--red)',
    },
    {
      name: 'POWER',
      value: fmt(portfolioTotal),
      descriptor: 'total portfolio',
      color: portfolioTotal >= 10000 ? 'var(--green)' : portfolioTotal >= 1000 ? 'var(--amber)' : 'var(--muted)',
    },
    {
      name: 'PRESTIGE',
      value: `${avgLevel.toFixed(1)} / 6.0`,
      descriptor: 'vault mastery',
      color: gradeColor,
    },
  ]

  return (
    <div className="page">
      {/* Character header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #16181f 0%, #12141a 100%)',
        border: `1px solid ${gradeColor}40`,
        padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
          fontSize: 120, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900,
          color: `${gradeColor}10`, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
        }}>{rank.grade}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Grade badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14,
              background: `${gradeColor}18`, border: `2px solid ${gradeColor}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 38, color: gradeColor,
            }}>{rank.grade}</div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)' }}>VAULT RANK</div>
          </div>

          {/* Title + message + XP bar */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, color: gradeColor, lineHeight: 1.1 }}>{rank.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{RANK_MESSAGES[rank.grade]}</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>XP to next rank</span>
                <span style={{ fontSize: 11, color: gradeColor, fontWeight: 600 }}>
                  {nextRank ? (progressToNext ?? 'Almost there') : 'MAX RANK'}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
                <div style={{ height: '100%', background: gradeColor, borderRadius: 3, width: `${xpPct}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* 2×2 stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0 }}>
            {[
              { icon: '💰', label: 'Net Worth',    value: fmt(trueNetWorth),           color: trueNetWorth >= 0 ? 'var(--text)' : 'var(--red)' },
              { icon: '📈', label: 'Invested',     value: fmt(investedCostBasis),      color: 'var(--text)' },
              { icon: '💾', label: 'Savings Rate', value: `${savingsRate.toFixed(0)}%`, color: savingsRate >= 20 ? 'var(--green)' : savingsRate >= 10 ? 'var(--amber)' : 'var(--red)' },
              { icon: '⚔️', label: 'Debt',         value: fmt(debtTotalRemain),         color: debtTotalRemain > 0 ? 'var(--red)' : 'var(--green)' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 12px', minWidth: 110 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{icon} {label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Track cards + detail modal */}
      <VaultRank data={data} prices={prices} netWorth={trueNetWorth} />

      {/* Stat Sheet */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 16 }}>Stat Sheet</div>
        <div className="grid-3" style={{ gap: 10 }}>
          {statSheet.map(({ name, value, descriptor, color }) => (
            <div key={name} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: 8 }}>{name}</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{descriptor}</div>
            </div>
          ))}
        </div>
      </div>

      <AchievementsWall
        saverValue={saverValue} investorValue={investorValue} cryptoValue={cryptoValue}
        totalExpenses={totalExpenses} savingsRate={savingsRate} data={data}
        debtPctPaid={debtPctPaid} trueNetWorth={trueNetWorth} superValue={superValue}
        liquidNetWorth={liquidNetWorth}
      />
    </div>
  )
}

const TIER_META = {
  bronze:   { label: '🥉 BRONZE',   color: '#cd7f32' },
  silver:   { label: '🥈 SILVER',   color: '#b0b8c8' },
  gold:     { label: '🥇 GOLD',     color: '#f0a500' },
  platinum: { label: '🏛️ PLATINUM', color: '#a87ef0' },
}

function AchievementsWall({ saverValue, investorValue, cryptoValue, totalExpenses, savingsRate, data, debtPctPaid, trueNetWorth, superValue, liquidNetWorth }) {
  const [selected, setSelected] = useState(null)

  const ACHIEVEMENTS = [
    // Bronze
    { id: 'first_buffer',     tier: 'bronze',   icon: '🥉', name: 'First Buffer',       desc: 'Reach $5,000 in liquid savings',            flavour: "Five grand liquid. Most people never get here. You did.",                                                                                                                    unlocked: saverValue >= 5000 },
    { id: 'safety_net',       tier: 'bronze',   icon: '🛡️', name: 'Safety Net',         desc: 'Cover 3 months of expenses in liquid savings',flavour: "Three months of runway. One surprise won't break you now.",                                                                                                              unlocked: saverValue >= totalExpenses * 3 },
    { id: 'first_position',   tier: 'bronze',   icon: '📈', name: 'First Position',     desc: 'Reach $5,000 in stocks or ETFs',            flavour: "Your money is working while you sleep. Welcome to the other side.",                                                                                                        unlocked: investorValue >= 5000 },
    { id: 'diamond_hands',    tier: 'bronze',   icon: '💎', name: 'Diamond Hands',      desc: 'Hold $5,000+ in crypto',                    flavour: "You held through the storm. Most paper hands are gone. You're still here.",                                                                                                  unlocked: cryptoValue >= 5000 },
    { id: 'debt_slayer',      tier: 'bronze',   icon: '⚔️', name: 'Debt Slayer',        desc: 'Pay off 25% of total debt',                 flavour: "A quarter of the chain is broken. The momentum is yours now.",                                                                                                             unlocked: debtPctPaid >= 25 },
    { id: 'saver_mode',       tier: 'bronze',   icon: '💹', name: 'Saver Mode',         desc: 'Sustain a 30%+ savings rate',               flavour: "Three in ten dollars saved. The wealth gap starts here.",                                                                                                                  unlocked: savingsRate >= 30 },
    // Silver
    { id: 'cash_fortress',    tier: 'silver',   icon: '🏰', name: 'Cash Fortress',      desc: 'Reach $25,000 in liquid savings',           flavour: "Twenty-five grand liquid. Sleep easy — you're covered for anything.",                                                                                                      unlocked: saverValue >= 25000 },
    { id: 'portfolio_builder',tier: 'silver',   icon: '💼', name: 'Portfolio Builder',  desc: 'Reach $25,000 in stocks and ETFs',          flavour: "Twenty-five thousand in the market. Compounding is silently making you rich.",                                                                                             unlocked: investorValue >= 25000 },
    { id: 'crypto_believer',  tier: 'silver',   icon: '🔮', name: 'Crypto Believer',    desc: 'Reach $25,000 in crypto',                   flavour: "On-chain and serious. The suits still don't understand this asset class.",                                                                                                 unlocked: cryptoValue >= 25000 },
    { id: 'debt_free',        tier: 'silver',   icon: '🗡️', name: 'Debt Free',          desc: 'Pay off 100% of total debt',                flavour: "DEBT FREE. There is no better financial feeling in the world.",                                                                                                            unlocked: debtPctPaid >= 100 },
    { id: 'savings_machine',  tier: 'silver',   icon: '🚀', name: 'Savings Machine',    desc: 'Sustain a 50%+ savings rate',               flavour: "Half your income retained. This is how wealth compounds fast.",                                                                                                            unlocked: savingsRate >= 50 },
    { id: 'goal_crusher',     tier: 'silver',   icon: '🏆', name: 'Goal Crusher',       desc: 'Complete 5 financial goals',                flavour: "Five goals crushed. Talk is cheap — you actually did it. Five times.",                                                                                                     unlocked: data.goals.filter(g => g.completed).length >= 5 },
    // Gold
    { id: 'liquidity_lord',   tier: 'gold',     icon: '👑', name: 'Liquidity Lord',     desc: 'Reach $100,000 in liquid savings',          flavour: "Six figures liquid. You could survive anything the economy throws at you.",                                                                                               unlocked: saverValue >= 100000 },
    { id: 'market_sovereign', tier: 'gold',     icon: '🌐', name: 'Market Sovereign',   desc: 'Reach $100,000 in stocks and ETFs',         flavour: "Market Sovereign. Your portfolio outlasts any single market event.",                                                                                                      unlocked: investorValue >= 100000 },
    { id: 'crypto_sovereign', tier: 'gold',     icon: '⚡', name: 'Crypto Sovereign',   desc: 'Reach $100,000 in crypto',                  flavour: "Vires in Numeris. The code never lies. You made it.",                                                                                                                     unlocked: cryptoValue >= 100000 },
    { id: 'true_wealth',      tier: 'gold',     icon: '✨', name: 'True Wealth',        desc: 'Reach $250,000 true net worth',             flavour: "Quarter million net worth. Generational wealth territory begins here.",                                                                                                   unlocked: trueNetWorth >= 250000 },
    { id: 'half_a_mill',      tier: 'gold',     icon: '💰', name: 'Half a Mill',        desc: 'Reach $500,000 liquid net worth',           flavour: "Half a million liquid. Most people retire on less. You're just getting started.",                                                                                         unlocked: liquidNetWorth >= 500000 },
    // Platinum
    { id: 'unlock_the_vault', tier: 'platinum', icon: '🏛️', name: 'Unlock The Vault',  desc: 'Reach $1,000,000 liquid net worth',         flavour: "THE VAULT IS YOURS. A million liquid. Years of discipline, sacrifice, and compounding — all of it led here. You didn't just build wealth. You built a legacy.",       unlocked: liquidNetWorth >= 1000000 },
  ]

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length
  const unlockedByTier = (t) => ACHIEVEMENTS.filter(a => a.tier === t && a.unlocked).length
  const byTier = (t) => ACHIEVEMENTS.filter(a => a.tier === t)
  const selectedAch = selected ? ACHIEVEMENTS.find(a => a.id === selected) : null

  const renderTile = (ach) => {
    const { id, icon, name, desc, unlocked } = ach
    const tierColor = TIER_META[ach.tier].color
    return (
      <div
        key={id}
        title={unlocked ? undefined : desc}
        onClick={() => { if (unlocked) setSelected(id) }}
        style={{
          background: 'var(--surface2)',
          borderRadius: 10,
          padding: '14px 12px',
          textAlign: 'center',
          border: unlocked ? `1px solid ${tierColor}40` : '1px solid var(--border)',
          opacity: unlocked ? 1 : 0.35,
          filter: unlocked ? 'none' : 'grayscale(1)',
          transition: 'box-shadow 0.18s, transform 0.18s',
          cursor: unlocked ? 'pointer' : 'default',
        }}
        onMouseEnter={e => {
          if (unlocked) {
            e.currentTarget.style.boxShadow = `0 0 16px ${tierColor}30`
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = ''
          e.currentTarget.style.transform = ''
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</div>
      </div>
    )
  }

  const platAch = byTier('platinum')[0]

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 4 }}>Achievements</div>
          <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 12 }}>
          <span>🥉 <b style={{ color: 'var(--text)' }}>{unlockedByTier('bronze')}</b></span>
          <span>🥈 <b style={{ color: 'var(--text)' }}>{unlockedByTier('silver')}</b></span>
          <span>🥇 <b style={{ color: 'var(--text)' }}>{unlockedByTier('gold')}</b></span>
        </div>
      </div>

      {/* Bronze / Silver / Gold tiers */}
      {(['bronze', 'silver', 'gold']).map(tier => (
        <div key={tier} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: TIER_META[tier].color, marginBottom: 10 }}>
            {TIER_META[tier].label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {byTier(tier).map(renderTile)}
          </div>
        </div>
      ))}

      {/* Platinum — full width */}
      {platAch && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: TIER_META.platinum.color, marginBottom: 10 }}>
            {TIER_META.platinum.label}
          </div>
          <div
            onClick={() => { if (platAch.unlocked) setSelected(platAch.id) }}
            title={platAch.unlocked ? undefined : platAch.desc}
            style={{
              background: platAch.unlocked
                ? 'linear-gradient(135deg, rgba(168,126,240,0.08) 0%, rgba(240,165,0,0.06) 100%)'
                : 'var(--surface2)',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              border: platAch.unlocked ? `1px solid ${TIER_META.platinum.color}50` : '1px solid var(--border)',
              opacity: platAch.unlocked ? 1 : 0.35,
              filter: platAch.unlocked ? 'none' : 'grayscale(1)',
              cursor: platAch.unlocked ? 'pointer' : 'default',
              transition: 'box-shadow 0.18s',
            }}
            onMouseEnter={e => {
              if (platAch.unlocked) e.currentTarget.style.boxShadow = `0 0 24px ${TIER_META.platinum.color}25`
            }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
          >
            <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{platAch.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, marginBottom: 4, color: platAch.unlocked ? TIER_META.platinum.color : 'var(--text)' }}>{platAch.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{platAch.desc}</div>
            </div>
            {platAch.unlocked && (
              <span style={{ fontSize: 11, fontWeight: 700, color: TIER_META.platinum.color, background: `${TIER_META.platinum.color}15`, padding: '4px 12px', borderRadius: 20, flexShrink: 0 }}>
                ✓ Unlocked
              </span>
            )}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedAch && (
        <Modal title="" onClose={() => setSelected(null)} size="modal-sm">
          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{selectedAch.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: TIER_META[selectedAch.tier].color, marginBottom: 8 }}>{TIER_META[selectedAch.tier].label}</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{selectedAch.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{selectedAch.desc}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              "{selectedAch.flavour}"
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'rgba(76,175,125,0.12)', padding: '5px 14px', borderRadius: 20 }}>
              ✓ Unlocked
            </span>
          </div>
        </Modal>
      )}
    </div>
  )
}
