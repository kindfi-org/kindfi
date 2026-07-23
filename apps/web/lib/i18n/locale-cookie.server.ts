import 'server-only'

import { cookies } from 'next/headers'
import { isSupportedLocale, LOCALE_COOKIE_NAME } from '~/lib/i18n/locale-cookie.shared'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

export async function getViewerLocale(): Promise<SupportedLocale> {
	const cookieStore = await cookies()
	const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value
	return isSupportedLocale(value) ? value : 'en'
}
