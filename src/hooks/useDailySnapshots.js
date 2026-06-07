import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useDailySnapshots() {
  const [snapshots, setSnapshots] = useState([])
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vault_daily_snapshots')
        .select('*')
        .order('date', { ascending: false })
        .limit(90)
      if (data) setSnapshots(data)
    }
    load()
  }, [])
  return snapshots
}

export async function takeDailySnapshot(netWorth, cryptoValue, stocksValue, etfValue, assetBreakdown) {
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase
    .from('vault_daily_snapshots')
    .select('id')
    .eq('date', today)
    .maybeSingle()
  if (existing) return // only snapshot once per day
  await supabase.from('vault_daily_snapshots').insert({
    date: today,
    net_worth: netWorth,
    crypto_value: cryptoValue,
    stocks_value: stocksValue,
    etf_value: etfValue,
    asset_breakdown: assetBreakdown,
  })
}
