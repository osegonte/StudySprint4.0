// frontend/src/common/hooks/useTheme.ts
import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

export const useTheme = () => {
  const { theme, toggleTheme } = useAppStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  }
}
