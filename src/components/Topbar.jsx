const PAGE_TITLES = {
  dashboard: 'Dashboard',
  portfolio: 'Portfolio',
  accounts: 'Accounts',
  budget: 'Budget',
  goals: 'Goals',
  calculator: 'Calculator',
  projects: 'Projects',
  schedules: 'Schedules',
  debts: 'Debts',
}

export function Topbar({ page, prices }) {
  const lastUpdated = prices?.lastUpdated
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className="topbar">
      {/* Desktop: page title */}
      <span className="topbar-title topbar-desktop-title">{PAGE_TITLES[page] || page}</span>

      {/* Mobile: Vault logo */}
      <div className="topbar-mobile-logo">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#f0a500" fillOpacity="0.15"/>
          <path d="M7 9h14M7 14h10M7 19h7" stroke="#f0a500" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--amber)', letterSpacing: '-0.5px' }}>Vault</span>
      </div>

      <div className="topbar-right">
        <span className="topbar-rate">
          {prices?.usdToAud && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              1 USD = <span style={{ color: 'var(--text)' }}>A${prices.usdToAud.toFixed(3)}</span>
            </span>
          )}
        </span>
        <div className="live-indicator">
          <div className={`live-dot ${prices?.live ? 'live' : ''}`} />
          <span className="live-label">{prices?.live ? `Live · ${timeStr}` : 'Connecting…'}</span>
        </div>
      </div>
    </header>
  )
}
