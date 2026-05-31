import { useState, useEffect, useCallback, useRef } from 'react'
import { getData, setData as persistData } from '../dataService'

/**
 * Drop-in replacement for useLocalStorage that syncs to Supabase.
 *
 * Startup sequence:
 *  1. Initialise state from localStorage instantly (no flash of empty UI).
 *  2. Fetch from Supabase asynchronously.
 *     - If Supabase has data → replace state with it and update localStorage.
 *     - If Supabase is empty → push localStorage data up (first-time migration).
 *     - If Supabase is unreachable → stay on localStorage data, mark syncStatus = 'error'.
 *  3. Once step 2 is done (success or error), set supabaseReady = true so that
 *     downstream effects that depend on fresh data (migration, schedule processor)
 *     can safely fire.
 *
 * On every user-triggered state change:
 *  - Update in-memory state and localStorage immediately.
 *  - Debounce-write to Supabase (400 ms).
 *
 * Returns: [data, setData, syncStatus, supabaseReady]
 *   syncStatus: 'syncing' | 'synced' | 'error'
 *   supabaseReady: boolean — true once the initial Supabase fetch is complete
 */
export function useSupabaseData(key, defaults) {
  // Initialise instantly from localStorage so the app renders without delay
  const [data, _setData] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaults
    } catch { return defaults }
  })

  const [syncStatus, setSyncStatus] = useState('syncing')
  const [supabaseReady, setSupabaseReady] = useState(false)

  // Version counter: incremented on every user-initiated state change.
  // Lets the sync effect know whether there is genuinely new data to write,
  // without relying on reference equality between the incoming and outgoing values.
  const writeCount = useRef(0)
  const syncedCount = useRef(0)
  const writeTimer = useRef(null)

  // ── Initial load from Supabase ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const remote = await getData(key)

        if (cancelled) return

        if (remote !== null) {
          // Supabase has data — use it (may be newer from another device)
          _setData(remote)
          try { localStorage.setItem(key, JSON.stringify(remote)) } catch {}
        } else {
          // Supabase row doesn't exist yet — migrate localStorage data up
          const stored = localStorage.getItem(key)
          const local = stored ? JSON.parse(stored) : defaults
          await persistData(key, local)
        }

        if (!cancelled) setSyncStatus('synced')
      } catch {
        // Supabase unreachable — fall back silently to localStorage
        if (!cancelled) setSyncStatus('error')
      } finally {
        // Always unblock downstream effects, even on error
        if (!cancelled) setSupabaseReady(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced sync to Supabase on user-triggered changes ────────────────
  useEffect(() => {
    if (!supabaseReady) return
    if (writeCount.current === syncedCount.current) return // nothing new to write

    clearTimeout(writeTimer.current)
    setSyncStatus('syncing')

    const targetCount = writeCount.current
    writeTimer.current = setTimeout(async () => {
      try {
        await persistData(key, data)
        syncedCount.current = targetCount
        setSyncStatus('synced')
      } catch {
        setSyncStatus('error')
      }
    }, 400)

    return () => clearTimeout(writeTimer.current)
  }, [data, key, supabaseReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public setter (mirrors the useLocalStorage API) ──────────────────────
  const setData = useCallback((updater) => {
    _setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (next === prev) return prev        // bail out — nothing actually changed
      writeCount.current++                  // mark as needing a Supabase write
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  return [data, setData, syncStatus, supabaseReady]
}
