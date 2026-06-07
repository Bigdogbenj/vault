import { useState, useMemo, useEffect } from 'react'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fmt, fmtFull, fmtNum, fmtNative, toAUD, toMonthly, genId, getNextFireTime, resolvedAccountBalance, LIVE_ACCOUNT_NAMES } from '../utils'
import { Modal, EditValueModal } from '../components/Modal'
import { useWeather } from '../hooks/useWeather'
import { VaultRank } from '../components/VaultRank'
import { useSnapshots, takeSnapshot } from '../hooks/useSnapshots'
import { takeDailySnapshot } from '../hooks/useDailySnapshots'

const QUIRKY = [
  'Welcome back, Benji',
  'The market awaits, Benji',
  'Compound interest is your friend, Benji',
  'Net worth loading… Benji detected',
  "Money doesn't sleep, Benji",
  'Time in the market beats timing the market, Benji',
  'Your future self says thanks, Benji',
  'Diversification is the only free lunch, Benji',
  'Another day, another dollar — compounded, Benji',
  'Inflation fears? Not today, Benji',
  'The best investment is the one you start, Benji',
]

function getGreeting() {
  if (Math.random() < 0.28) return QUIRKY[Math.floor(Math.random() * QUIRKY.length)]
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, Benji'
  if (h < 17) return 'Good afternoon, Benji'
  return 'Good evening, Benji'
}

const ACCOUNT_COLORS = ['#f0a500', '#5b9ef0', '#a87ef0', '#4caf7d', '#4caf7d', '#5b9ef0', '#f0a500']


function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export function Dashboard({ data, updateData, prices }) {
  const [editAccount, setEditAccount] = useState(null)
  const [greeting] = useState(getGreeting)
  const [now, setNow] = useState(new Date())
  const weather = useWeather()
  const snapshots = useSnapshots()
  const [range, setRange] = useState('1M')

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const usdToAud = prices?.usdToAud ?? 1.55
  const totalBalance = useMemo(
    () => data.accounts.reduce((s, a) => s + resolvedAccountBalance(a, data, prices), 0),
    [data.accounts, data.crypto, data.stocks, data.etfs, prices] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const totalDebt = useMemo(
    () => (data.debts ?? []).reduce((s, d) => s + (d.remaining || 0), 0),
    [data.debts]
  )
  const superBalance = useMemo(
    () => { const a = data.accounts.find(acc => acc.type === 'Super'); return a ? resolvedAccountBalance(a, data, prices) : 0 },
    [data.accounts, prices] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const liquidNetWorth = totalBalance - superBalance
  const trueNetWorth = totalBalance - totalDebt
  const totalIncome = useMemo(() => data.budget.income.reduce((s, i) => s + i.amount, 0), [data.budget.income])
  const totalExpenses = useMemo(() => data.budget.expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0), [data.budget.expenses])
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100).toFixed(0) : 0

  const pieData = data.accounts.map((a, i) => ({ name: a.name, value: resolvedAccountBalance(a, data, prices), color: a.color || ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] }))

  const cryptoValue = useMemo(() => data.crypto.reduce((s, c) => {
    const p = prices?.crypto?.[c.coinId]?.aud ?? 0
    return s + c.amount * p
  }, 0), [data.crypto, prices])

  const stockValue = useMemo(() => data.stocks.reduce((s, st) => {
    const p = prices?.stocks?.[st.ticker]?.aud ?? 0
    return s + st.shares * p
  }, 0), [data.stocks, prices])

  const etfValue = useMemo(() => data.etfs.reduce((s, e) => {
    const p = prices?.etfs?.[e.ticker]?.aud ?? 0
    return s + e.units * p
  }, 0), [data.etfs, prices])

  const livePortfolio = cryptoValue + stockValue + etfValue

  useEffect(() => {
    if (!prices?.live) return
    const assetBreakdown = {}
    data.crypto.forEach(c => {
      assetBreakdown[c.coinId] = { symbol: c.symbol, name: c.name, type: 'crypto', value: c.amount * (prices?.crypto?.[c.coinId]?.aud ?? 0) }
    })
    data.stocks.forEach(s => {
      assetBreakdown[s.ticker] = { symbol: s.ticker, name: s.name, type: 'stocks', value: s.shares * (prices?.stocks?.[s.ticker]?.aud ?? 0) }
    })
    data.etfs.forEach(e => {
      assetBreakdown[e.ticker] = { symbol: e.ticker, name: e.name, type: 'etfs', value: e.units * (prices?.etfs?.[e.ticker]?.aud ?? 0) }
    })
    takeSnapshot(totalBalance, cryptoValue, stockValue, etfValue)
    takeDailySnapshot(totalBalance, cryptoValue, stockValue, etfValue, assetBreakdown)
  }, [prices?.live]) // eslint-disable-line react-hooks/exhaustive-deps

  const trend = useMemo(() => {
    if (snapshots.length === 0) return []
    const now = new Date()
    const cutoffs = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
    const days = cutoffs[range] ?? 30
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - days)
    return snapshots
      .filter(s => new Date(s.date) >= cutoff)
      .map(s => ({
        date: new Date(s.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
        value: s.net_worth,
        crypto: s.crypto_value,
        stocks: s.stocks_value,
        etfs: s.etf_value,
      }))
  }, [snapshots, range])

  return (
    <div className="page">
      {/* Header: greeting + clock + weather */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #191c22 0%, #14161a 100%)', borderColor: 'rgba(240,165,0,0.12)', padding: '20px 24px' }}>
        <div className="dash-hero-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{greeting}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5 }}>Here's your financial overview</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>
              {now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--amber)', letterSpacing: '-0.5px' }}>
              {now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {weather && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {weather.emoji} {weather.temp}°C · Brisbane
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Net worth + stats */}
      <div className="grid-4">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a1d22 0%, #14161a 100%)', borderColor: liquidNetWorth < 0 ? 'rgba(224,91,91,0.25)' : 'rgba(76,175,125,0.2)' }}>
          <div className="stat-label">Liquid Net Worth</div>
          <div className="stat-value" style={{ fontSize: 26, color: liquidNetWorth < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(liquidNetWorth)}</div>
          <div className="stat-sub" style={{ marginTop: 6 }}>excl. Super ({fmt(superBalance)})</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a1d22 0%, #14161a 100%)', borderColor: 'rgba(240,165,0,0.2)' }}>
          <div className="stat-label">Gross Net Worth</div>
          <div className="stat-value" style={{ fontSize: 26, color: 'var(--amber)' }}>{fmt(totalBalance)}</div>
          <div className="stat-sub" style={{ marginTop: 6 }}>All assets incl. Super, debt excluded</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a1d22 0%, #14161a 100%)', borderColor: trueNetWorth < 0 ? 'rgba(224,91,91,0.25)' : 'rgba(76,175,125,0.2)' }}>
          <div className="stat-label">True Net Worth</div>
          <div className="stat-value" style={{ fontSize: 26, color: trueNetWorth < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(trueNetWorth)}</div>
          <div className="stat-sub" style={{ marginTop: 6 }}>Assets minus {fmt(totalDebt)} debt</div>
        </div>
        <StatCard label="Monthly Savings" value={fmt(savings)} sub={`${savingsRate}% savings rate`} color={savings >= 0 ? 'var(--green)' : 'var(--red)'} />
      </div>

      {/* Charts row */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <span className="section-title">Net Worth Trend</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1D','1W','1M','3M','6M','1Y'].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`tab ${range === r ? 'active' : ''}`}
                  style={{ marginBottom: 0, padding: '3px 8px', fontSize: 11 }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {trend.length < 2 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
              Not enough data yet — come back tomorrow as history builds up 📈
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gradNW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0a500" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f0a500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v), 'Net Worth']} labelStyle={{ color: 'var(--muted)' }} />
                <Area type="monotone" dataKey="value" stroke="#f0a500" strokeWidth={2} fill="url(#gradNW)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <span className="section-title">Account Allocation</span>
            <span className="text-sm text-muted">{fmt(totalBalance)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v) => [fmt(v)]} labelStyle={{ color: 'var(--muted)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pieData.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="color-dot" style={{ background: e.color }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{(e.value / totalBalance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio breakdown charts */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Portfolio Breakdown</span>
          <span className="text-sm text-muted">{range}</span>
        </div>
        {trend.length < 2 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            Not enough data yet — come back tomorrow as history builds up 📈
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { key: 'crypto', label: 'Crypto',  color: '#a87ef0', gradId: 'gradCrypto' },
              { key: 'stocks', label: 'Stocks',  color: '#4caf7d', gradId: 'gradStocks' },
              { key: 'etfs',   label: 'ETFs',    color: '#5b9ef0', gradId: 'gradEtfs'   },
            ].map(({ key, label, color, gradId }) => {
              const current = trend[trend.length - 1]?.[key] ?? 0
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(current)}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [fmt(v), label]} labelStyle={{ color: 'var(--muted)' }} />
                      <Area type="monotone" dataKey={key} stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Accounts quick view */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Accounts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {data.accounts.map((acc, i) => (
            <div key={acc.id} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div className="color-dot" style={{ background: acc.color || ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] }} />
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{acc.type}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{acc.name}</div>
              {LIVE_ACCOUNT_NAMES.includes(acc.name) ? (
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700 }}>
                  {fmt(resolvedAccountBalance(acc, data, prices))}
                </span>
              ) : (
                <>
                  <span
                    className="editable-val"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700 }}
                    onClick={() => setEditAccount(acc)}
                  >{fmtNative(acc.balance, acc.currency)}</span>
                  {acc.currency === 'USD' && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>≈ {fmt(toAUD(acc.balance, 'USD', usdToAud))}</div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Budget & Goals row */}
      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <span className="section-title">Budget Summary</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Total Income</span>
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>{fmt(totalIncome)}</span>
            </div>
            {data.budget.expenses.map(exp => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{exp.name}</span>
                <span style={{ fontSize: 13 }}>{fmt(exp.amount)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ fontWeight: 600 }}>Net Savings</span>
              <span style={{ fontWeight: 700, color: savings >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(savings)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <span className="section-title">Goals Progress</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.goals.map(g => {
              const pct = Math.min(100, Math.round(g.current / g.target * 100))
              const remaining = g.target - g.current
              const mthsLeft = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : null
              return (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{g.icon} {g.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(g.current)} of {fmt(g.target)}</span>
                    {mthsLeft !== null && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{mthsLeft} mo left</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Schedules + Pools widgets */}
      {((data.schedules ?? []).length > 0 || Object.values(data.pools ?? {}).some(p => p.available > 0)) && (
        <div className="grid-2">
          {/* Upcoming Transfers */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Upcoming Transfers</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>next 3</span>
            </div>
            {(() => {
              const upcoming = (data.schedules ?? [])
                .filter(s => s.active)
                .map(s => ({ ...s, nextFire: getNextFireTime(s, new Date()) }))
                .filter(s => s.nextFire != null)
                .sort((a, b) => a.nextFire - b.nextFire)
                .slice(0, 3)
              if (upcoming.length === 0) return <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>No upcoming transfers</div>
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.map(s => {
                    const typeColor = s.type === 'income' ? 'var(--green)' : 'var(--blue)'
                    const d = s.nextFire
                    const now = new Date()
                    const diff = d - now
                    const days = Math.floor(diff / (24 * 3600 * 1000))
                    const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
                    const dayLabel = days === 0 ? `Today ${time}` : days === 1 ? `Tomorrow ${time}` : d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${time}`
                    return (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{dayLabel}</div>
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: typeColor }}>{s.type === 'income' ? '+' : ''}{fmt(s.amount)}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Investment Pools */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Investment Pools</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(data.pools ?? {}).map(([id, pool]) => {
                const cfg = { crypto: { label: 'Crypto Pool', color: '#a87ef0', icon: '🔮' }, stocks: { label: 'Stocks Pool', color: '#4caf7d', icon: '📈' }, etfs: { label: 'ETF Pool', color: '#5b9ef0', icon: '🏦' } }[id]
                if (!cfg) return null
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(pool.weeklyContribution)}/week · {fmt(pool.deployedTotal)} deployed</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: cfg.color }}>{fmt(pool.available)}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>available</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vault Rank */}
      <div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Vault Rank</div>
        <VaultRank data={data} prices={prices} netWorth={trueNetWorth} />
      </div>

      {editAccount && (
        <EditValueModal
          label={`${editAccount.name} Balance`}
          value={editAccount.balance}
          onClose={() => setEditAccount(null)}
          onSave={(v) => {
            updateData('accounts', data.accounts.map(a => a.id === editAccount.id ? { ...a, balance: parseFloat(v) } : a))
          }}
        />
      )}
    </div>
  )
}
