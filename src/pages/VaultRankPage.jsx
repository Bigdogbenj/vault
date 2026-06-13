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
      />
    </div>
  )
}

function AchievementsWall({ saverValue, investorValue, cryptoValue, totalExpenses, savingsRate, data, debtPctPaid, trueNetWorth, superValue }) {
  const [selected, setSelected] = useState(null)

  const ACHIEVEMENTS = [
    { id: 'first_buffer',    icon: '🏦', name: 'First Buffer',         desc: 'Reach $1,000 in savings',              flavour: "The first $1,000 is the hardest. You've crossed the line most people never reach.",                 unlocked: saverValue >= 1000 },
    { id: 'emergency_fund',  icon: '🛡️', name: 'Safety Net',           desc: 'Cover 3 months of expenses',            flavour: "Three months of runway. One surprise won't break you now.",                                       unlocked: saverValue >= totalExpenses * 3 },
    { id: 'cash_fortress',   icon: '🏰', name: 'Cash Fortress',        desc: 'Reach $10,000 in liquid savings',       flavour: "Ten grand liquid. Sleep easy — you're covered.",                                                  unlocked: saverValue >= 10000 },
    { id: 'first_invest',    icon: '📈', name: 'First Position',       desc: 'Make your first investment',            flavour: "Your money is working while you sleep. Welcome to the other side.",                              unlocked: investorValue > 0 },
    { id: 'five_k_portfolio',icon: '💼', name: 'Portfolio Builder',    desc: 'Reach $10,000 in stocks/ETFs',          flavour: "Five figures in the market. Compounding has entered the chat.",                                   unlocked: investorValue >= 10000 },
    { id: 'crypto_entry',    icon: '🔮', name: 'Down the Rabbit Hole', desc: 'Hold any crypto',                       flavour: "Down the rabbit hole. There's no going back now.",                                               unlocked: cryptoValue > 0 },
    { id: 'diamond_hands',   icon: '💎', name: 'Diamond Hands',        desc: 'Hold $10,000+ in crypto',               flavour: "You held through the storm. Most paper hands are gone. You're still here.",                      unlocked: cryptoValue >= 10000 },
    { id: 'diversified',     icon: '🌐', name: 'Diversified',          desc: 'Hold $1,000+ in stocks/ETFs and crypto',flavour: "Spread across asset classes like a true wealth builder.",                                        unlocked: investorValue >= 1000 && cryptoValue >= 1000 },
    { id: 'budget_setup',    icon: '📋', name: 'Budget Boss',          desc: 'Set up income and expenses',            flavour: "You know your numbers. That alone puts you ahead of most people.",                               unlocked: data.budget.income.length > 0 && data.budget.expenses.length > 0 },
    { id: 'first_goal',      icon: '🎯', name: 'Goal Setter',          desc: 'Create your first goal',                flavour: "A goal without a plan is just a wish. You have both.",                                           unlocked: data.goals.length > 0 },
    { id: 'goal_crusher',    icon: '🏆', name: 'Goal Crusher',         desc: 'Complete a goal',                       flavour: "Talk is cheap. You actually did it.",                                                            unlocked: data.goals.some(g => g.completed) },
    { id: 'savings_rate_20', icon: '💹', name: 'Saver Mode',           desc: 'Hit a 20% savings rate',                flavour: "One in five dollars saved. The wealth gap starts here.",                                         unlocked: savingsRate >= 20 },
    { id: 'savings_rate_40', icon: '🚀', name: 'Savings Machine',      desc: 'Hit a 40% savings rate',                flavour: "Nearly half your income retained. This is how wealth compounds fast.",                           unlocked: savingsRate >= 40 },
    { id: 'debt_aware',      icon: '⚔️', name: 'Debt Aware',           desc: 'Track your debts in Vault',             flavour: "Naming the enemy is how you beat it.",                                                          unlocked: (data.debts?.length ?? 0) > 0 },
    { id: 'debt_10',         icon: '🗡️', name: 'Chipping Away',        desc: 'Pay off 10% of total debt',             flavour: "Ten percent down. The avalanche is picking up speed.",                                          unlocked: debtPctPaid >= 10 },
    { id: 'nw_positive',     icon: '✨', name: 'In The Green',         desc: 'Achieve positive true net worth',        flavour: "Assets exceed liabilities. You're building, not sinking.",                                      unlocked: trueNetWorth > 0 },
    { id: 'nw_10k',          icon: '💰', name: 'Five Figures',         desc: 'Reach $10,000 net worth',               flavour: "Five figures of net worth. The foundation is real.",                                            unlocked: trueNetWorth >= 10000 },
    { id: 'super_starter',   icon: '🌱', name: 'Super Starter',        desc: 'Have super balance over $10,000',       flavour: "Future you is already grateful. The seed is planted.",                                          unlocked: superValue >= 10000 },
  ]

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length
  const selectedAch = selected ? ACHIEVEMENTS.find(a => a.id === selected) : null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)' }}>Achievements</div>
        <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {ACHIEVEMENTS.map(({ id, icon, name, desc, unlocked }) => (
          <div
            key={id}
            title={unlocked ? undefined : desc}
            onClick={() => { if (unlocked) setSelected(id) }}
            style={{
              background: 'var(--surface2)',
              borderRadius: 10,
              padding: '14px 12px',
              textAlign: 'center',
              border: unlocked ? '1px solid rgba(240,165,0,0.3)' : '1px solid var(--border)',
              opacity: unlocked ? 1 : 0.35,
              filter: unlocked ? 'none' : 'grayscale(1)',
              transition: 'box-shadow 0.18s, transform 0.18s',
              cursor: unlocked ? 'pointer' : 'default',
            }}
            onMouseEnter={e => {
              if (unlocked) {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(240,165,0,0.2)'
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
        ))}
      </div>

      {selectedAch && (
        <Modal title="" onClose={() => setSelected(null)} size="modal-sm">
          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{selectedAch.icon}</div>
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
