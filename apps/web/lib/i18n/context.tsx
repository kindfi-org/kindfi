'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { setLocaleCookie } from '~/lib/i18n/locale-cookie.shared'
import { safeLocalStorageGet, safeLocalStorageSet } from '~/lib/utils/safe-storage'
import { loadLocaleBundle } from './load-locale'
import { en } from './translations/en'

export type Language = 'en' | 'es'

// Recursive translation dictionary where leaves are strings or string arrays
export interface TranslationDict {
	[key: string]: string | string[] | TranslationDict
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object'
}

function resolveInBundle(dict: unknown, key: string): string | string[] | undefined {
	const keys = key.split('.')
	let value: unknown = dict

	for (const k of keys) {
		if (isRecord(value)) {
			value = value[k]
		} else {
			return undefined
		}
	}

	if (typeof value === 'string' || Array.isArray(value)) {
		return value
	}

	return undefined
}

interface I18nContextType {
	language: Language
	setLanguage: (lang: Language) => void
	t: (key: string) => string
	tArray: (key: string) => string[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
	children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
	const [language, setLanguageState] = useState<Language>('en')
	const [bundles, setBundles] = useState<Partial<Record<Language, TranslationDict>>>({ en })

	// Load language from localStorage on mount
	useEffect(() => {
		const savedLanguage = safeLocalStorageGet('language') as Language
		if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
			setLocaleCookie(savedLanguage)
			const timer = setTimeout(() => {
				setLanguageState(savedLanguage)
			}, 0)
			return () => clearTimeout(timer)
		}
	}, [])

	// Lazy-load inactive locale bundles when the active language changes
	useEffect(() => {
		if (bundles[language]) return

		let cancelled = false
		void loadLocaleBundle(language).then((bundle) => {
			if (!cancelled) {
				setBundles((prev) => ({ ...prev, [language]: bundle }))
			}
		})

		return () => {
			cancelled = true
		}
	}, [language, bundles])

	const setLanguage = (lang: Language) => {
		setLanguageState(lang)
		safeLocalStorageSet('language', lang)
		setLocaleCookie(lang)
		document.documentElement.lang = lang
	}

	const resolveValue = (key: string): string | string[] | undefined => {
		const activeBundle = bundles[language]
		return (
			(activeBundle ? resolveInBundle(activeBundle, key) : undefined) ??
			resolveInBundle(en, key) ??
			(bundles.en ? resolveInBundle(bundles.en, key) : undefined)
		)
	}

	const t = (key: string): string => {
		const resolved = resolveValue(key)
		return typeof resolved === 'string' ? resolved : key
	}

	const tArray = (key: string): string[] => {
		const resolved = resolveValue(key)
		return Array.isArray(resolved) ? resolved : []
	}

	return (
		<I18nContext.Provider value={{ language, setLanguage, t, tArray }}>
			{children}
		</I18nContext.Provider>
	)
}

export function useI18n() {
	const context = useContext(I18nContext)
	if (context === undefined) {
		throw new Error('useI18n must be used within an I18nProvider')
	}
	return context
}
