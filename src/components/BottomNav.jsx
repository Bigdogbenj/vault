import { useState } from 'react'

const MAIN_NAV = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'performance', label: 'Daily',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
  },
  {
    id: 'portfolio', label: 'Portfolio',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'schedules', label: 'Schedules',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="16" r="2"/></svg>,
  },
]

const MORE_NAV = [
  {
    id: 'accounts', label: 'Accounts',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    id: 'debts', label: 'Debts',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  },
  {
    id: 'budget', label: 'Budget',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    id: 'goals', label: 'Goals',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    id: 'projects', label: 'Projects',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    id: 'vaultrank', label: 'Vault Rank',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21h8M12 21V9M5 3l2 6h10l2-6"/><path d="M5 3H3M19 3h2"/></svg>,
  },
  {
    id: 'trades', label: 'Trades',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h13l-3-3M17 17H4l3 3"/><path d="M7 7v5M17 17v-5"/></svg>,
  },
]

const MORE_IDS = new Set(MORE_NAV.map(i => i.id))

export function BottomNav({ page, setPage }) {
  const [trayOpen, setTrayOpen] = useState(false)
  const moreActive = MORE_IDS.has(page)

  const navigate = (id) => {
    setPage(id)
    setTrayOpen(false)
  }

  return (
    <>
      {/* Backdrop — covers content area, bottom 64px left clear so nav stays tappable */}
      {trayOpen && (
        <div
          onClick={() => setTrayOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 64,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 150,
          }}
        />
      )}

      {/* More tray — slides up from above the bottom nav */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 64,
          transform: trayOpen ? 'translateY(0)' : 'translateY(calc(100% + 80px))',
          transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          background: 'var(--surface)',
          borderRadius: '16px 16px 0 0',
          borderTop: '1px solid var(--border)',
          overflow: 'hidden',
          zIndex: 199,
          pointerEvents: trayOpen ? 'auto' : 'none',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--border)',
          margin: '12px auto',
        }} />

        {MORE_NAV.map((item, idx) => {
          const active = page === item.id
          const isLast = idx === MORE_NAV.length - 1
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                width: '100%', padding: '14px 24px',
                background: active ? 'rgba(240,165,0,0.08)' : 'none',
                border: 'none',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                color: active ? 'var(--amber)' : 'var(--text)',
                fontSize: 15, fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: active ? 'var(--amber)' : 'var(--muted)',
              }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}

        <div style={{ height: 8 }} />
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {MAIN_NAV.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* More button — highlighted when active page is in the tray */}
        <button
          className={`bottom-nav-item ${moreActive || trayOpen ? 'active' : ''}`}
          onClick={() => setTrayOpen(o => !o)}
        >
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
            <circle cx="5" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="19" cy="12" r="2" fill="currentColor"/>
          </svg>
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
