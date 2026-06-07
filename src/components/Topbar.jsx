const PAGE_TITLES = {
  dashboard: 'Dashboard',
  portfolio: 'Portfolio',
  accounts: 'Accounts',
  budget: 'Budget',
  goals: 'Goals',
  projects: 'Projects',
  schedules: 'Schedules',
  debts: 'Debts',
}

function SyncIndicator({ status }) {
  const color = status === 'synced'
    ? 'var(--green)'
    : status === 'error'
    ? 'var(--red)'
    : 'var(--amber)'

  const title = status === 'synced'
    ? 'Synced to cloud'
    : status === 'error'
    ? 'Sync error — data saved locally'
    : 'Syncing…'

  return (
    <div title={title} style={{ display: 'flex', alignItems: 'center' }}>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={status === 'syncing' ? 'sync-pulse' : ''}
        style={{ transition: 'stroke 0.4s', flexShrink: 0 }}
      >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        {status === 'synced' && (
          <polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2"/>
        )}
        {status === 'error' && (
          <>
            <line x1="12" y1="13" x2="12" y2="16" stroke={color} strokeWidth="2"/>
            <line x1="12" y1="18" x2="12" y2="18.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </div>
  )
}

export function Topbar({ page, prices, syncStatus = 'syncing' }) {
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
        <SyncIndicator status={syncStatus} />
        <div className="live-indicator">
          <div className={`live-dot ${prices?.live ? 'live' : ''}`} />
          <span className="live-label">{prices?.live ? `Live · ${timeStr}` : 'Connecting…'}</span>
        </div>
      </div>
    </header>
  )
}
