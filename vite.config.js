import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import YahooFinance from 'yahoo-finance2'

// Single YahooFinance instance shared across all requests (handles crumb caching internally)
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'yahoo-quotes',
      // Server-side endpoint: /api/quotes?symbols=AMZN,TSLA,VAS.AX
      // Runs in Node.js — no CORS issues, yahoo-finance2 handles auth/crumb automatically.
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/quotes')) return next()
          try {
            const qs = req.url.includes('?') ? req.url.split('?')[1] : ''
            const symbolsParam = new URLSearchParams(qs).get('symbols') ?? ''
            const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean)
            if (symbols.length === 0) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'symbols parameter required' }))
              return
            }
            const raw = await yf.quote(symbols)
            const quotes = Array.isArray(raw) ? raw : [raw]
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify(quotes))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      },
    },
  ],
})
