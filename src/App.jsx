import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Dashboard } from './pages/Dashboard'
import { Portfolio } from './pages/Portfolio'
import { Accounts } from './pages/Accounts'
import { Budget } from './pages/Budget'
import { Goals } from './pages/Goals'
import { Calculator } from './pages/Calculator'
import { Projects } from './pages/Projects'
import { Debts } from './pages/Debts'
import { Schedules } from './pages/Schedules'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePrices } from './hooks/usePrices'
import { DEFAULTS } from './data/defaults'
import { Ticker } from './components/Ticker'
import { BottomNav } from './components/BottomNav'
import { getDueInstances } from './utils'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [data, setData] = useLocalStorage('vault-v1', DEFAULTS)

  // ── Migration: backfill fields added after initial release ──────────────────
  useEffect(() => {
    setData(prev => {
      const missingCrypto = DEFAULTS.crypto.filter(
        dc => !prev.crypto.some(c => c.coinId === dc.coinId)
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

      // Add schedules/pools/logs if missing (existing user)
      const nowIso = new Date().toISOString()
      const extras = {}
      if (!prev.schedules) extras.schedules = DEFAULTS.schedules.map(s => ({ ...s, lastFiredAt: nowIso }))
      if (!prev.pools) extras.pools = DEFAULTS.pools
      if (!prev.transferLog) extras.transferLog = []
      if (!prev.poolDeployments) extras.poolDeployments = []
      const hasExtras = Object.keys(extras).length > 0

      if (missingCrypto.length === 0 && !etfsChanged && !goalsChanged && !hasExtras) return prev
      return { ...prev, ...extras, crypto: [...prev.crypto, ...missingCrypto], etfs: updatedEtfs, goals: updatedGoals }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Schedule processor: runs on every mount, catches up missed transfers ───
  useEffect(() => {
    setData(prev => {
      const schedules = prev.schedules ?? []
      if (schedules.length === 0) return prev

      const now = new Date()
      const accounts = prev.accounts.map(a => ({ ...a }))
      const pools = JSON.parse(JSON.stringify(prev.pools ?? DEFAULTS.pools))
      const newLogs = []
      const updatedSchedules = schedules.map(s => ({ ...s }))

      // Collect all due instances across all active schedules
      const allDue = []
      schedules.filter(s => s.active).forEach(s => {
        getDueInstances(s, now).forEach(t => allDue.push({ scheduleId: s.id, fireTime: t }))
      })
      if (allDue.length === 0) return prev

      // Process in chronological order — income before transfers on the same timestamp
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
        const toLabel = s.toPool
          ? `${s.toPool.charAt(0).toUpperCase() + s.toPool.slice(1)} Pool`
          : (prev.accounts.find(a => a.id === s.toAccount)?.name ?? 'Unknown')

        if (s.type === 'income' && s.toAccount) {
          const i = accounts.findIndex(a => a.id === s.toAccount)
          if (i >= 0) accounts[i].balance = (accounts[i].balance || 0) + s.amount
        } else if (s.type === 'transfer') {
          if (s.fromAccount) {
            const i = accounts.findIndex(a => a.id === s.fromAccount)
            if (i >= 0) accounts[i].balance = (accounts[i].balance || 0) - s.amount
          }
          if (s.toAccount) {
            const i = accounts.findIndex(a => a.id === s.toAccount)
            if (i >= 0) accounts[i].balance = (accounts[i].balance || 0) + s.amount
          } else if (s.toPool && pools[s.toPool] != null) {
            pools[s.toPool].available = (pools[s.toPool].available || 0) + s.amount
          }
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const prices = usePrices(data.crypto, data.stocks, data.etfs)
  const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }))
  const pageProps = { data, updateData, prices }

  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar page={page} prices={prices} />
        <Ticker data={data} prices={prices} />
        <main className="main-content">
          {page === 'dashboard'  && <Dashboard  {...pageProps} />}
          {page === 'portfolio'  && <Portfolio  {...pageProps} />}
          {page === 'accounts'   && <Accounts   {...pageProps} />}
          {page === 'budget'     && <Budget     {...pageProps} />}
          {page === 'goals'      && <Goals      {...pageProps} />}
          {page === 'calculator' && <Calculator {...pageProps} />}
          {page === 'projects'   && <Projects   {...pageProps} />}
          {page === 'debts'      && <Debts      {...pageProps} />}
          {page === 'schedules'  && <Schedules  {...pageProps} />}
        </main>
      </div>
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
