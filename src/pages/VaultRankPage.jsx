import { VaultRank } from '../components/VaultRank'

export function VaultRankPage({ data, updateData, prices }) {
  const totalDebt = (data.debts ?? []).reduce((s, d) => s + (d.remaining || 0), 0)
  const totalBalance = data.accounts.reduce((s, a) => s + (a.balance ?? 0), 0)
  const trueNetWorth = totalBalance - totalDebt
  return (
    <div className="page">
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Vault Rank</div>
      <VaultRank data={data} prices={prices} netWorth={trueNetWorth} />
    </div>
  )
}
