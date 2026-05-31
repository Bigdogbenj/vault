import { supabase } from './supabase'

/**
 * Read a value from vault_data by key.
 * Returns null if the row doesn't exist yet.
 * Throws if Supabase is unreachable (let the caller handle fallback).
 */
export async function getData(key) {
  const { data, error } = await supabase
    .from('vault_data')
    .select('value')
    .eq('key', key)
    .single()

  // PGRST116 = "no rows returned" — table exists but key not yet written
  if (error && error.code !== 'PGRST116') throw error
  return data?.value ?? null
}

/**
 * Upsert a value into vault_data and mirror it to localStorage as an offline fallback.
 * Throws if Supabase is unreachable.
 */
export async function setData(key, value) {
  // Always keep localStorage in sync so the app works offline
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}

  const { error } = await supabase
    .from('vault_data')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) throw error
}
