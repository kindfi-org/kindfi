import type { Language, TranslationDict } from './context'
import { en } from './translations/en'

const localeLoaders: Record<Language, () => Promise<TranslationDict>> = {
	en: async () => en,
	es: async () => {
		const { es } = await import('./translations/es')
		return es
	},
}

export async function loadLocaleBundle(language: Language): Promise<TranslationDict> {
	return localeLoaders[language]()
}
