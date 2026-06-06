import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export default async function handler(req, res) {
  const { symbols } = req.query
  if (!symbols) return res.status(400).json({ error: 'symbols required' })

  try {
    const syms = symbols.split(',').map(s => s.trim()).filter(Boolean)
    const raw = await yf.quote(syms)
    const quotes = Array.isArray(raw) ? raw : [raw]
    res.setHeader('Cache-Control', 's-maxage=60')
    return res.status(200).json(quotes)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
