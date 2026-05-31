import { useState, useEffect } from 'react'

function codeToEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

const URL = 'https://api.open-meteo.com/v1/forecast?latitude=-27.47&longitude=153.02&current=temperature_2m,weather_code&timezone=Australia/Brisbane'

async function fetchWeather(setWeather) {
  try {
    const r = await fetch(URL)
    const d = await r.json()
    setWeather({
      temp: Math.round(d.current.temperature_2m),
      emoji: codeToEmoji(d.current.weather_code),
    })
  } catch {}
}

export function useWeather() {
  const [weather, setWeather] = useState(null)
  useEffect(() => {
    fetchWeather(setWeather)
    const iv = setInterval(() => fetchWeather(setWeather), 30 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])
  return weather
}
