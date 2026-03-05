import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getResolved(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('interva-theme') as ThemeMode | null
    return saved ?? 'system'
  })

  const [resolved, setResolved] = useState<'light' | 'dark'>(() => getResolved(
    (localStorage.getItem('interva-theme') as ThemeMode | null) ?? 'system'
  ))

  useEffect(() => {
    const r = getResolved(mode)
    setResolved(r)
    if (r === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const r = mq.matches ? 'dark' : 'light'
      setResolved(r)
      if (r === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  function setMode(m: ThemeMode) {
    setModeState(m)
    localStorage.setItem('interva-theme', m)
  }

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
