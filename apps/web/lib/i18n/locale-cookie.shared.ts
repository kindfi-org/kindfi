import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

export const LOCALE_COOKIE_NAME = 'kindfi_locale'

export function isSupportedLocale(value: string | undefined | null): value is SupportedLocale {
	return value === 'en' || value === 'es'
}

export function setLocaleCookie(lang: SupportedLocale): void {
	if (typeof document === 'undefined') return
	document.cookie = `${LOCALE_COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`
}
