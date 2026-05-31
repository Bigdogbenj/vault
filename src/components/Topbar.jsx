const PAGE_TITLES = {
  dashboard: 'Dashboard',
  portfolio: 'Portfolio',
  accounts: 'Accounts',
  budget: 'Budget',
  goals: 'Goals',
  calculator: 'Calculator',
  projects: 'Projects',
}

export function Topbar({ page, prices }) {
  const lastUpdated = prices?.lastUpdated
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className="topbar">
      <span className="topbar-title">{PAGE_TITLES[page] || page}</span>
      <div className="topbar-right">
        {prices?.usdToAud && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            1 USD = <span style={{ color: 'var(--text)' }}>A${prices.usdToAud.toFixed(3)}</span>
          </span>
        )}
        <div className="live-indicator">
          <div className={`live-dot ${prices?.live ? 'live' : ''}`} />
          <span>{prices?.live ? `Live · ${timeStr}` : 'Connecting…'}</span>
        </div>
      </div>
    </header>
  )
}
