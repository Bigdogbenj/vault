import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Dashboard } from './pages/Dashboard'
import { Portfolio } from './pages/Portfolio'
import { Accounts } from './pages/Accounts'
import { Budget } from './pages/Budget'
import { Goals } from './pages/Goals'
import { Projects } from './pages/Projects'
import { Debts } from './pages/Debts'
import { Schedules } from './pages/Schedules'
import { DailyPerformance } from './pages/DailyPerformance'
import { VaultRankPage } from './pages/VaultRankPage'
import { useSupabaseData } from './hooks/useSupabaseData'
import { usePrices } from './hooks/usePrices'
import { DEFAULTS } from './data/defaults'
import { Ticker } from './components/Ticker'
import { BottomNav } from './components/BottomNav'
import { getDueInstances } from './utils'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [data, setData, syncStatus, supabaseReady] = useSupabaseData('vault-v1', DEFAULTS)

  // ── Migration: backfill fields added after initial release ──────────────────
  // Runs once after the initial Supabase fetch so we operate on the authoritative data.
  useEffect(() => {
    if (!supabaseReady) return
    setData(prev => {
      const deletedCoinIds = prev._deletedCoinIds ?? []
      const deletedStockTickers = prev._deletedStockTickers ?? []
      const deletedEtfTickers = prev._deletedEtfTickers ?? []
      const missingCrypto = DEFAULTS.crypto.filter(
        dc => !prev.crypto.some(c => c.coinId === dc.coinId) && !deletedCoinIds.includes(dc.coinId)
      )
      const missingStocks = DEFAULTS.stocks.filter(
        ds => !prev.stocks.some(s => s.ticker === ds.ticker) && !deletedStockTickers.includes(ds.ticker)
      )
      const missingEtfs = DEFAULTS.etfs.filter(
        de => !prev.etfs.some(e => e.ticker === de.ticker) && !deletedEtfTickers.includes(de.ticker)
      )
      const updatedEtfs = prev.etfs.map(e => {
        const def = DEFAULTS.etfs.find(d => d.ticker === e.ticker)
        return def?.manualPriceAud != null && e.manualPriceAud == null
          ? { ...e, manualPriceAud: def.manualPriceAud }
          : e
      })
      const ICON_TO_CAT = { '✈️': 'Holiday', '💻': 'Tech', '📈': 'Investment', '🛡️': 'Emergency', '🚗': 'Car', '🏠': 'House', '🔐': 'Crypto' }
      const updatedGoals = prev.goals.map(g => ({
        category: ICON_TO_CAT[g.icon] ?? 'Other',
        startingAmount: 0,
        createdAt: null,
        completed: false,
        completedAt: null,
        targetDate: null,
        ...g,
      }))
      const goalsChanged = updatedGoals.some((g, i) => g !== prev.goals[i])
      const etfsChanged = updatedEtfs.some((e, i) => e !== prev.etfs[i])

      const nowIso = new Date().toISOString()
      const extras = {}
      if (!prev.schedules) extras.schedules = DEFAULTS.schedules.map(s => ({ ...s, lastFiredAt: nowIso }))
      const mergedPools = { ...DEFAULTS.pools, ...(prev.pools ?? {}) }
      const poolsChanged = JSON.stringify(mergedPools) !== JSON.stringify(prev.pools ?? {})
      if (poolsChanged) extras.pools = mergedPools
      if (!prev.transferLog) extras.transferLog = []
      if (!prev.poolDeployments) extras.poolDeployments = []
      if (!prev.transactions) extras.transactions = []
      if (!prev.monthlyAllocations) extras.monthlyAllocations = []
      if (!prev.projSettings) extras.projSettings = { years: 10, rate: { crypto: 15, etfs: 11, stocks: 15 }, monthly: { crypto: 200, etfs: 500, stocks: 300 } }
      const hasExtras = Object.keys(extras).length > 0 || poolsChanged

      if (missingCrypto.length === 0 && missingStocks.length === 0 && missingEtfs.length === 0 && !etfsChanged && !goalsChanged && !hasExtras) return prev
      return {
        ...prev, ...extras,
        crypto: [...prev.crypto, ...missingCrypto],
        stocks: [...prev.stocks, ...missingStocks],
        etfs: [...updatedEtfs, ...missingEtfs.filter(de => !updatedEtfs.some(e => e.ticker === de.ticker))],
        goals: updatedGoals,
      }
    })
  }, [supabaseReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Schedule processor: catches up missed transfers after Supabase loads ──
  useEffect(() => {
    if (!supabaseReady) return
    setData(prev => {
      const schedules = prev.schedules ?? []
      if (schedules.length === 0) return prev

      const now = new Date()
      const accounts = prev.accounts.map(a => ({ ...a }))
      const pools = JSON.parse(JSON.stringify(prev.pools ?? DEFAULTS.pools))
      const newLogs = []
      const updatedSchedules = schedules.map(s => ({ ...s }))

      const allDue = []
      schedules.filter(s => s.active).forEach(s => {
        getDueInstances(s, now).forEach(t => allDue.push({ scheduleId: s.id, fireTime: t }))
      })
      if (allDue.length === 0) return prev

      allDue.sort((a, b) => {
        const dt = a.fireTime - b.fireTime
        if (dt !== 0) return dt
        const sa = schedules.find(s => s.id === a.scheduleId)
        const sb = schedules.find(s => s.id === b.scheduleId)
        if (sa?.type === 'income' && sb?.type !== 'income') return -1
        if (sb?.type === 'income' && sa?.type !== 'income') return 1
        return 0
      })

      allDue.forEach(({ scheduleId, fireTime }) => {
        const sIdx = updatedSchedules.findIndex(x => x.id === scheduleId)
        if (sIdx < 0) return
        const s = updatedSchedules[sIdx]
        if (s.lastFiredAt && new Date(s.lastFiredAt) >= fireTime) return

        const fromLabel = s.type === 'income'
          ? (s.sourceLabel || 'Income')
          : (prev.accounts.find(a => a.id === s.fromAccount)?.name ?? 'Unknown')
        const toLabel = s.type === 'expense'
          ? 'Expense'
          : s.toPool
          ? `${s.toPool.charAt(0).toUpperCase() + s.toPool.slice(1)} Pool`
          : (prev.accounts.find(a => a.id === s.toAccount)?.name ?? 'Unknown')

        console.log('Schedule fired:', s.name, 'from:', fromLabel, 'amount:', s.amount)

        if (s.type === 'income' && s.toAccount) {
          const i = accounts.findIndex(a => a.id === s.toAccount)
          if (i >= 0) accounts[i].balance = (Number(accounts[i].balance) || 0) + s.amount
        } else if (s.type === 'transfer') {
          if (s.fromAccount) {
            const i = accounts.findIndex(a => a.id === s.fromAccount)
            if (i >= 0) accounts[i].balance = (Number(accounts[i].balance) || 0) - s.amount
          }
          if (s.toAccount) {
            const i = accounts.findIndex(a => a.id === s.toAccount)
            if (i >= 0) accounts[i].balance = (Number(accounts[i].balance) || 0) + s.amount
          } else if (s.toPool && pools[s.toPool]) {
            pools[s.toPool].available = (Number(pools[s.toPool].available) || 0) + s.amount
          }
        } else if (s.type === 'expense' && s.fromAccount) {
          const i = accounts.findIndex(a => a.id === s.fromAccount)
          if (i >= 0) accounts[i].balance = (Number(accounts[i].balance) || 0) - s.amount
        }

        newLogs.push({
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
          scheduleId: s.id,
          scheduleName: s.name,
          type: s.type,
          amount: s.amount,
          fromLabel,
          toLabel,
          firedAt: fireTime.toISOString(),
        })

        updatedSchedules[sIdx] = { ...s, lastFiredAt: fireTime.toISOString() }
      })

      if (newLogs.length === 0) return prev
      return {
        ...prev,
        accounts,
        pools,
        schedules: updatedSchedules,
        transferLog: [...newLogs, ...(prev.transferLog ?? [])],
      }
    })
  }, [supabaseReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const prices = usePrices(data.crypto, data.stocks, data.etfs)
  const updateData = (key, value) => setData(prev => {
    if (key === 'crypto') {
      const removed = (prev.crypto ?? []).filter(c => !value.some(v => v.coinId === c.coinId)).map(c => c.coinId)
      const _deletedCoinIds = [...new Set([...(prev._deletedCoinIds ?? []), ...removed])]
      return { ...prev, crypto: value, _deletedCoinIds }
    }
    if (key === 'stocks') {
      const removed = (prev.stocks ?? []).filter(s => !value.some(v => v.ticker === s.ticker)).map(s => s.ticker)
      const _deletedStockTickers = [...new Set([...(prev._deletedStockTickers ?? []), ...removed])]
      return { ...prev, stocks: value, _deletedStockTickers }
    }
    if (key === 'etfs') {
      const removed = (prev.etfs ?? []).filter(e => !value.some(v => v.ticker === e.ticker)).map(e => e.ticker)
      const _deletedEtfTickers = [...new Set([...(prev._deletedEtfTickers ?? []), ...removed])]
      return { ...prev, etfs: value, _deletedEtfTickers }
    }
    return { ...prev, [key]: value }
  })
  const pageProps = { data, updateData, prices }

  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar page={page} prices={prices} syncStatus={syncStatus} />
        <Ticker data={data} prices={prices} />
        <main className="main-content">
          {page === 'dashboard'   && <Dashboard     {...pageProps} />}
          {page === 'performance' && <DailyPerformance data={data} prices={prices} />}
          {page === 'portfolio'  && <Portfolio  {...pageProps} />}
          {page === 'accounts'   && <Accounts   {...pageProps} />}
          {page === 'budget'     && <Budget     {...pageProps} setPage={setPage} />}
          {page === 'goals'      && <Goals      {...pageProps} accounts={data.accounts} />}
          {page === 'projects'   && <Projects   {...pageProps} />}
          {page === 'debts'      && <Debts      {...pageProps} />}
          {page === 'schedules'  && <Schedules  {...pageProps} />}
          {page === 'vaultrank'  && <VaultRankPage {...pageProps} />}
        </main>
      </div>
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
