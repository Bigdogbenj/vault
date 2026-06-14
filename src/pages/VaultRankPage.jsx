import { useMemo, useState, useEffect } from 'react'
import { VaultRank, useVaultRankInfo, RANK_MESSAGES, OVERALL_RANKS, GRADE_COLORS } from '../components/VaultRank'
import { VaultRankMap } from '../components/VaultRankMap'
import { resolvedAccountBalance, fmt } from '../utils'
import { Modal } from '../components/Modal'
import { useSnapshots } from '../hooks/useSnapshots'

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

  const snapshots = useSnapshots()
  const daysActive = useMemo(() => {
    if (!snapshots.length) return null
    const first = new Date(snapshots[0].date)
    return Math.floor((Date.now() - first.getTime()) / 86400000)
  }, [snapshots])

  const daysInRank = useMemo(() => {
    const achieved = data.rankAchievedAt ?? '2026-06-06T00:00:00Z'
    return Math.floor((Date.now() - new Date(achieved).getTime()) / 86400000)
  }, [data.rankAchievedAt])

  const rankHistory = data.rankHistory ?? []

  useEffect(() => {
    if (!rank?.grade) return
    const prevGrade = data.currentRankGrade ?? 'F'
    if (prevGrade === rank.grade) return
    const achievedAt = data.rankAchievedAt ?? '2026-06-06T00:00:00Z'
    const daysSpent = Math.floor((Date.now() - new Date(achievedAt).getTime()) / 86400000)
    const newHistory = [...(data.rankHistory ?? []), {
      grade: prevGrade,
      promotedTo: rank.grade,
      achievedAt: new Date().toISOString(),
      daysSpent,
    }]
    updateData({
      rankAchievedAt: new Date().toISOString(),
      rankHistory: newHistory,
      currentRankGrade: rank.grade,
    })
  }, [rank.grade])

  const liquidityMonths = totalExpenses > 0 ? saverValue / totalExpenses : null
  const defencePct = totalExpenses > 0 ? Math.min(100, (saverValue / (totalExpenses * 6)) * 100) : 0
  const portfolioTotal = investorValue + cryptoValue
  const debtRatio = (totalDebt + totalBalance) > 0 ? (totalDebt / (totalDebt + totalBalance)) * 100 : 0
  const prestigeScore = ['F', 'D', 'C', 'B', 'A', 'S'].indexOf(rank.grade) + (xpPct / 100)

  const liveTracks = useMemo(() => {
    const g = rank.grade
    const completedGoals = (data.goals ?? []).filter(goal => goal.completed).length
    if (g === 'F') return [
      { pct: saverValue > 0 ? 100 : 0 },
      { pct: investorValue > 0 ? 100 : 0 },
      { pct: cryptoValue > 0 ? 100 : 0 },
      { pct: 100 },
      { pct: superValue > 0 ? 100 : 0 },
      { pct: (data.debts ?? []).length > 0 ? 100 : 0 },
    ]
    if (g === 'D') return [
      { pct: Math.min(100, saverValue / 10000 * 100) },
      { pct: Math.min(100, investorValue / 10000 * 100) },
      { pct: Math.min(100, cryptoValue / 10000 * 100) },
      { pct: Math.min(100, savingsRate / 25 * 100) },
      { pct: Math.min(100, superValue / 15000 * 100) },
      { pct: Math.min(100, debtPctPaid / 10 * 100) },
    ]
    if (g === 'C') return [
      { pct: Math.min(100, saverValue / 20000 * 100) },
      { pct: Math.min(100, investorValue / 25000 * 100) },
      { pct: Math.min(100, cryptoValue / 25000 * 100) },
      { pct: Math.min(100, savingsRate / 35 * 100) },
      { pct: Math.min(100, superValue / 40000 * 100) },
      { pct: Math.min(100, debtPctPaid / 25 * 100) },
    ]
    if (g === 'B') return [
      { pct: Math.min(100, saverValue / 40000 * 100) },
      { pct: Math.min(100, investorValue / 60000 * 100) },
      { pct: Math.min(100, cryptoValue / 50000 * 100) },
      { pct: Math.min(100, savingsRate / 45 * 100) },
      { pct: Math.min(100, superValue / 80000 * 100) },
      { pct: Math.min(100, debtPctPaid / 40 * 100) },
    ]
    if (g === 'A') return [
      { pct: Math.min(100, saverValue / 80000 * 100) },
      { pct: Math.min(100, investorValue / 120000 * 100) },
      { pct: Math.min(100, cryptoValue / 100000 * 100) },
      { pct: Math.min(100, savingsRate / 55 * 100) },
      { pct: Math.min(100, superValue / 150000 * 100) },
      { pct: Math.min(100, debtPctPaid / 60 * 100) },
    ]
    return [
      { pct: Math.min(100, saverValue / 150000 * 100) },
      { pct: Math.min(100, investorValue / 250000 * 100) },
      { pct: Math.min(100, cryptoValue / 200000 * 100) },
      { pct: Math.min(100, savingsRate / 65 * 100) },
      { pct: Math.min(100, superValue / 280000 * 100) },
      { pct: Math.min(100, debtPctPaid) },
    ]
  }, [rank.grade, saverValue, investorValue, cryptoValue, savingsRate, superValue, debtPctPaid, totalExpenses, data.goals, data.debts])

  return (
    <div className="page">
      <VaultRankMap
        currentRank={rank.grade}
        rankProgress={xpPct / 100}
        tracks={liveTracks}
        netWorth={trueNetWorth}
        invested={investedCostBasis}
        debt={debtTotalRemain}
        savingsRate={savingsRate}
        daysActive={daysActive}
        liquidityMonths={liquidityMonths}
        attackPerMonth={savings}
        defencePct={defencePct}
        yieldPct={savingsRate}
        powerTotal={portfolioTotal}
        prestigeScore={prestigeScore}
        debtRatio={debtRatio}
        daysInRank={daysInRank}
        rankHistory={rankHistory}
      />

      <RankRoadmap rank={rank} nextRank={nextRank} avgLevel={avgLevel} trueNetWorth={trueNetWorth} />
      <VaultRank data={data} prices={prices} netWorth={trueNetWorth} />

      <AchievementsWall
        saverValue={saverValue} investorValue={investorValue} cryptoValue={cryptoValue}
        totalExpenses={totalExpenses} savingsRate={savingsRate} data={data}
        debtPctPaid={debtPctPaid} trueNetWorth={trueNetWorth} superValue={superValue}
        liquidNetWorth={liquidNetWorth} updateData={updateData}
      />
      <MilestoneHistory log={data.achievementLog} rankHistory={rankHistory} />
    </div>
  )
}

const RANK_REQ = {
  F: 'Starting rank',
  D: '$10k NW · $10k banked',
  C: '$50k NW · $50k invested',
  B: '$150k NW · $100k invested · $75k super',
  A: '$300k NW · debt <30% assets',
  S: '$600k NW · 3× L6 tracks · $500k super',
}

function RankRoadmap({ rank, nextRank, avgLevel, trueNetWorth }) {
  const currentIdx = OVERALL_RANKS.findIndex(r => r.grade === rank.grade)

  return (
    <div className="card">
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 20 }}>Rank Roadmap</div>

      {/* Timeline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
        {OVERALL_RANKS.flatMap((r, i) => {
          const isAchieved = i < currentIdx
          const isCurrent = i === currentIdx
          const color = GRADE_COLORS[r.grade]

          const node = (
            <div key={r.grade} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 84 }}>
              <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCurrent && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>YOU ARE HERE</span>
                )}
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: isAchieved || isCurrent ? `${color}22` : 'var(--surface2)',
                border: `2px solid ${isAchieved || isCurrent ? color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 17,
                color: isAchieved || isCurrent ? color : 'var(--muted)',
                boxShadow: isCurrent ? `0 0 0 4px ${color}15, 0 0 14px ${color}30` : 'none',
              }}>
                {isAchieved ? '✓' : r.grade}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? color : isAchieved ? 'var(--text)' : 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>
                {r.title}
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.4, padding: '0 4px' }}>
                {RANK_REQ[r.grade]}
              </div>
            </div>
          )

          const connector = i < OVERALL_RANKS.length - 1 ? (
            <div key={`c-${i}`} style={{ flex: 1, minWidth: 12, paddingTop: 41 }}>
              <div style={{
                height: 2,
                background: isAchieved ? GRADE_COLORS[OVERALL_RANKS[i + 1].grade] : 'transparent',
                borderTop: !isAchieved ? '2px dashed var(--border)' : 'none',
                opacity: !isAchieved ? 0.4 : 1,
              }} />
            </div>
          ) : null

          return connector ? [node, connector] : [node]
        })}
      </div>

      {/* Next rank callout */}
      {nextRank && (() => {
        const nc = GRADE_COLORS[nextRank.grade]
        const reqs = []
        if (nextRank.minAvg > avgLevel) reqs.push(`Avg level ${nextRank.minAvg} (currently ${avgLevel.toFixed(1)})`)
        if (nextRank.minNW > trueNetWorth && nextRank.minNW > 0 && nextRank.minNW !== -Infinity)
          reqs.push(`${fmt(nextRank.minNW)} net worth (currently ${fmt(trueNetWorth)})`)
        if (nextRank.requireAllFive) reqs.push('All tracks at level 5+')
        return (
          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 8, border: `1px solid ${nc}30`, background: `${nc}08` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: nc, marginBottom: reqs.length ? 10 : 0 }}>
              Next rank: {nextRank.grade} — {nextRank.title}
            </div>
            {reqs.map(req => (
              <div key={req} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: nc, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{req}</span>
              </div>
            ))}
            {reqs.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text)' }}>All requirements met — almost there!</div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

const TIER_META = {
  bronze:   { label: '🥉 BRONZE',   color: '#cd7f32' },
  silver:   { label: '🥈 SILVER',   color: '#b0b8c8' },
  gold:     { label: '🥇 GOLD',     color: '#f0a500' },
  platinum: { label: '🏛️ PLATINUM', color: '#a87ef0' },
}

function AchievementsWall({ saverValue, investorValue, cryptoValue, totalExpenses, savingsRate, data, debtPctPaid, trueNetWorth, superValue, liquidNetWorth, updateData }) {
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

  const unlockedKey = ACHIEVEMENTS.filter(a => a.unlocked).map(a => a.id).sort().join(',')
  useEffect(() => {
    const log = data.achievementLog ?? []
    const loggedIds = new Set(log.map(e => e.id))
    const newEntries = ACHIEVEMENTS
      .filter(a => a.unlocked && !loggedIds.has(a.id))
      .map(a => ({ id: a.id, name: a.name, tier: a.tier, icon: a.icon, unlockedAt: new Date().toISOString() }))
    if (newEntries.length > 0) {
      updateData('achievementLog', [...log, ...newEntries])
    }
  }, [unlockedKey]) // eslint-disable-line react-hooks/exhaustive-deps

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

function MilestoneHistory({ log, rankHistory }) {
  const achievementEntries = [...(log ?? [])].map(e => ({ ...e, entryType: 'achievement' }))
  const rankEntries = (rankHistory ?? []).map(e => ({
    id: `rank-${e.grade}-${e.promotedTo}`,
    entryType: 'rank',
    icon: { F:'🗑️', D:'🪙', C:'🏠', B:'🏢', A:'🏆', S:'🏦' }[e.promotedTo] ?? '⭐',
    name: `Promoted to Rank ${e.promotedTo}`,
    tier: 'rank',
    unlockedAt: e.achievedAt,
    daysSpent: e.daysSpent,
    grade: e.grade,
    promotedTo: e.promotedTo,
  }))
  const sorted = [...achievementEntries, ...rankEntries]
    .sort((a, b) => new Date(a.unlockedAt) - new Date(b.unlockedAt))

  return (
    <div className="card">
      <div style={{ marginBottom: sorted.length ? 20 : 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 4 }}>Milestone History</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Your journey, recorded forever</div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
          No milestones yet — keep building.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{
            position: 'absolute', left: 8, top: 4, bottom: 4,
            width: 2, background: 'rgba(240,165,0,0.25)', borderRadius: 1,
          }} />
          {sorted.map((entry, i) => {
            const tierColor = TIER_META[entry.tier]?.color ?? 'var(--amber)'
            const date = new Date(entry.unlockedAt)
            const dateStr = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 12, marginBottom: i < sorted.length - 1 ? 18 : 0, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: -24, top: 5,
                  width: 8, height: 8, borderRadius: '50%',
                  background: tierColor, flexShrink: 0,
                  boxShadow: `0 0 6px ${tierColor}60`,
                }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{entry.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{entry.name}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                    color: tierColor, background: `${tierColor}18`,
                    padding: '2px 8px', borderRadius: 10,
                  }}>
                    {TIER_META[entry.tier]?.label ?? entry.tier}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap', marginTop: 2, textAlign: 'right' }}>
                  {dateStr}
                  {entry.entryType === 'rank' && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Spent {entry.daysSpent} days at Rank {entry.grade}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
