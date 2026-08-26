import type { TypedSupabaseClient } from '@packages/lib/types'
import { getOppositeLocale, type SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { ContentEntityType, ContentTranslationRow } from './types'

export async function fetchContentTranslations(
	client: TypedSupabaseClient,
	entityType: ContentEntityType,
	entityIds: string[],
	locale: SupportedLocale,
): Promise<Map<string, ContentTranslationRow>> {
	if (entityIds.length === 0) return new Map()

	const { data, error } = await client
		.from('content_translations')
		.select('*')
		.eq('entity_type', entityType)
		.in('entity_id', entityIds)
		.eq('locale', locale)
		.in('status', ['complete', 'pending', 'stale'])

	if (error) throw error

	const map = new Map<string, ContentTranslationRow>()
	for (const row of data ?? []) {
		map.set(row.entity_id, row as ContentTranslationRow)
	}
	return map
}

export async function fetchContentTranslation(
	client: TypedSupabaseClient,
	entityType: ContentEntityType,
	entityId: string,
	locale: SupportedLocale,
): Promise<ContentTranslationRow | null> {
	const map = await fetchContentTranslations(client, entityType, [entityId], locale)
	return map.get(entityId) ?? null
}

export async function fetchOppositeLocaleTranslation(
	client: TypedSupabaseClient,
	entityType: ContentEntityType,
	entityId: string,
	sourceLocale: SupportedLocale,
): Promise<ContentTranslationRow | null> {
	return fetchContentTranslation(client, entityType, entityId, getOppositeLocale(sourceLocale))
}
