const safe = (n) => (n == null || isNaN(n)) ? 0 : n

export const fmt = (n, opts = {}) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0, ...opts }).format(safe(n))

export const fmtFull = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(safe(n))

export const fmtNum = (n, d = 4) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: d })
}

export const pct = (n) => `${n >= 0 ? '+' : ''}${Number(n).toFixed(2)}%`

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

export const toAUD = (balance, currency, usdToAud) => {
  const b = balance ?? 0
  if (!currency || currency === 'AUD') return b
  if (currency === 'USD') return b * (usdToAud ?? 1.55)
  return b
}

export const fmtNative = (balance, currency) => {
  if (currency === 'USD')
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(balance ?? 0)
  return fmt(balance)
}

export const FREQ_MULTIPLIERS = { weekly: 52 / 12, fortnightly: 26 / 12, monthly: 1, quarterly: 1 / 3 }

// ─── Schedule helpers ────────────────────────────────────────────────────────

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

// Returns the next Date this schedule fires, strictly after `afterDate`
export function getNextFireTime(schedule, afterDate) {
  const after = afterDate instanceof Date ? afterDate : new Date(afterDate)
  const { frequency, dayOfWeek, hour, minute, startDate } = schedule
  const dom = schedule.dayOfMonth ?? 1

  if (frequency === 'once') {
    const t = parseLocalDate(startDate)
    t.setHours(hour, minute, 0, 0)
    return t > after ? t : null
  }

  if (frequency === 'weekly') {
    const daysToAdd = (dayOfWeek - after.getDay() + 7) % 7
    const candidate = new Date(after)
    candidate.setDate(after.getDate() + daysToAdd)
    candidate.setHours(hour, minute, 0, 0)
    if (candidate <= after) candidate.setDate(candidate.getDate() + 7)
    return candidate
  }

  if (frequency === 'fortnightly') {
    const sd = parseLocalDate(startDate)
    const daysToAnchor = (dayOfWeek - sd.getDay() + 7) % 7
    const anchor = new Date(sd)
    anchor.setDate(sd.getDate() + daysToAnchor)
    anchor.setHours(hour, minute, 0, 0)
    if (anchor > after) return anchor
    const msPerFortnight = 14 * 24 * 3600 * 1000
    const periods = Math.floor((after.getTime() - anchor.getTime()) / msPerFortnight) + 1
    return new Date(anchor.getTime() + periods * msPerFortnight)
  }

  if (frequency === 'monthly') {
    let candidate = new Date(after.getFullYear(), after.getMonth(), dom, hour, minute, 0, 0)
    if (candidate <= after) candidate = new Date(after.getFullYear(), after.getMonth() + 1, dom, hour, minute, 0, 0)
    return candidate
  }

  if (frequency === 'quarterly') {
    const sd = parseLocalDate(startDate)
    let q = new Date(sd.getFullYear(), sd.getMonth(), dom, hour, minute, 0, 0)
    if (q < sd) q.setMonth(q.getMonth() + 3)
    while (q <= after) q.setMonth(q.getMonth() + 3)
    return q
  }

  return null
}

// Returns all Date instances where this schedule was due between lastFiredAt and now
export function getDueInstances(schedule, now) {
  if (!schedule.active) return []
  const sd = parseLocalDate(schedule.startDate)
  const lookFrom = schedule.lastFiredAt
    ? new Date(schedule.lastFiredAt)
    : new Date(sd.getTime() - 1)
  const instances = []
  let cursor = getNextFireTime(schedule, lookFrom)
  while (cursor != null && cursor <= now) {
    instances.push(new Date(cursor))
    if (schedule.frequency === 'once') break
    cursor = getNextFireTime(schedule, cursor)
  }
  return instances
}
export const toMonthly = (amount, frequency) => (amount ?? 0) * (FREQ_MULTIPLIERS[frequency ?? 'monthly'] ?? 1)

export const CATEGORY_COLORS = {
  Housing: '#5b9ef0',
  Food: '#4caf7d',
  Utilities: '#a87ef0',
  Transport: '#f0a500',
  Subscriptions: '#e05b5b',
  Other: '#6b7280',
}
