'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { TRANSLATIONS } from './translations'

const LanguageContext = createContext(undefined)

const STORAGE_KEY = 'landbidLang'

/**
 * Very small i18n layer — a dictionary lookup with `{placeholder}` support.
 * Deliberately not a routing-based solution: the language is a user preference,
 * not part of the URL, so a stored choice survives every navigation.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'hi' || saved === 'en') setLangState(saved)
    setReady(true)
  }, [])

  const setLang = useCallback((next) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'hi' : 'en')
  }, [lang, setLang])

  /**
   * @param {string} key   dot-free key from translations.js
   * @param {Record<string, string|number>} [vars]
   */
  const t = useCallback(
    (key, vars) => {
      const table = TRANSLATIONS[lang] || TRANSLATIONS.en
      let value = table[key]
      // Fall back to English, then to the key itself, so a missing string is
      // never rendered as blank
      if (value === undefined) value = TRANSLATIONS.en[key]
      if (value === undefined) return key
      if (!vars) return value
      return Object.keys(vars).reduce(
        (acc, name) => acc.replaceAll(`{${name}}`, String(vars[name])),
        value
      )
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, ready }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
