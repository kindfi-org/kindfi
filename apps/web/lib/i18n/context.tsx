'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'es'

// Recursive translation dictionary where leaves are strings
export interface TranslationDict {
	[key: string]: string | TranslationDict
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object'
}

interface I18nContextType {
	language: Language
	setLanguage: (lang: Language) => void
	t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
	children: React.ReactNode
	translations: Record<Language, TranslationDict>
}

export function I18nProvider({ children, translations }: I18nProviderProps) {
	const [language, setLanguageState] = useState<Language>('en')

	// Load language from localStorage on mount
	// Use setTimeout to avoid React Compiler warning about setState in effect
	useEffect(() => {
		const savedLanguage = localStorage.getItem('language') as Language
		if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
			// Schedule state update in next tick to avoid synchronous setState in effect
			const timer = setTimeout(() => {
				setLanguageState(savedLanguage)
			}, 0)
			return () => clearTimeout(timer)
		}
	}, [])

	const setLanguage = (lang: Language) => {
		setLanguageState(lang)
		localStorage.setItem('language', lang)
		// Update HTML lang attribute for accessibility
		document.documentElement.lang = lang
	}

	const t = (key: string): string => {
		const keys = key.split('.')
		let value: unknown = translations[language]

		for (const k of keys) {
			if (isRecord(value)) {
				value = (value as Record<string, unknown>)[k]
			} else {
				return key // Return key if translation not found
			}
		}

		return typeof value === 'string' ? value : key
	}

	return (
		<I18nContext.Provider value={{ language, setLanguage, t }}>
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
