import { useMemo } from 'react'
import { VaultRank, useVaultRankInfo, RANK_MESSAGES } from '../components/VaultRank'
import { resolvedAccountBalance, fmt } from '../utils'

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
    </div>
  )
}
