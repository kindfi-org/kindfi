import { z } from 'zod'

export const supportedLocaleSchema = z.enum(['en', 'es'])

export type SupportedLocale = z.infer<typeof supportedLocaleSchema>

export const sourceLocaleSchema = supportedLocaleSchema

export function getOppositeLocale(locale: SupportedLocale): SupportedLocale {
	return locale === 'en' ? 'es' : 'en'
}
