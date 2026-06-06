import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vault_snapshots')
        .select('*')
        .order('date', { ascending: true })
      if (data) setSnapshots(data)
    }
    load()
  }, [])

  return snapshots
}

export async function takeSnapshot(netWorth, cryptoValue, stocksValue, etfValue) {
  const today = new Date().toISOString().slice(0, 10)
  await supabase
    .from('vault_snapshots')
    .upsert(
      { date: today, net_worth: netWorth, crypto_value: cryptoValue, stocks_value: stocksValue, etf_value: etfValue },
      { onConflict: 'date' }
    )
}
