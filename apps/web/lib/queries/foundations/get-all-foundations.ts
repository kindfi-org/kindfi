import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	fetchContentTranslations,
	type LocalizeOptions,
	resolveFoundationFields,
} from '~/lib/services/content-translation'

/** Sort options for the public foundations directory (labels + query mapping). */
export const FOUNDATION_LIST_SORT_NAV = [
	{ slug: 'most-recent', label: 'Most recent' },
	{ slug: 'most-donations', label: 'Most raised' },
	{ slug: 'most-campaigns', label: 'Most campaigns' },
	{ slug: 'newest', label: 'Newest (year)' },
	{ slug: 'oldest', label: 'Oldest (year)' },
] as const

export type FoundationListSortSlug = (typeof FOUNDATION_LIST_SORT_NAV)[number]['slug']

const sortMap: Record<FoundationListSortSlug, { column: string; ascending: boolean }> = {
	'most-recent': { column: 'created_at', ascending: false },
	'most-donations': { column: 'total_donations_received', ascending: false },
	'most-campaigns': { column: 'total_campaigns_completed', ascending: false },
	oldest: { column: 'founded_year', ascending: true },
	newest: { column: 'founded_year', ascending: false },
}

export function normalizeFoundationListSort(
	slug: string | null | undefined,
): FoundationListSortSlug {
	const raw = slug ?? 'most-recent'
	return FOUNDATION_LIST_SORT_NAV.some((o) => o.slug === raw)
		? (raw as FoundationListSortSlug)
		: 'most-recent'
}

export type GetAllFoundationsOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getAllFoundations(
	client: TypedSupabaseClient,
	sortSlug = 'most-recent',
	limit?: number,
	options?: GetAllFoundationsOptions,
) {
	const normalized = normalizeFoundationListSort(sortSlug)
	const { column, ascending } = sortMap[normalized]

	let query = client
		.from('foundations')
		.select(
			`
      id,
      name,
      slug,
      description,
      story,
      impact_highlights,
      logo_url,
      cover_image_url,
      founder_id,
      founded_year,
      mission,
      vision,
      website_url,
      social_links,
      source_locale,
      total_donations_received,
      total_campaigns_completed,
      total_campaigns_open,
      created_at,
      updated_at
    `,
		)
		.order(column, { ascending })

	if (limit) {
		query = query.limit(limit)
	}

	const { data, error } = await query

	if (error) throw error

	if (!data || data.length === 0) {
		return []
	}

	const foundationIds = data.map((f) => f.id)
	const translations =
		options?.localize !== false
			? await fetchContentTranslations(
					client,
					'foundation',
					foundationIds,
					options?.viewerLocale ?? 'en',
				)
			: new Map()

	// Fetch profiles separately since founder_id references users.id, not profiles.id
	const founderIds = [...new Set(data.map((f) => f.founder_id))]
	const { data: profilesData } = await client
		.from('profiles')
		.select('id, display_name, image_url, slug')
		.in('id', founderIds)

	const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]))

	return data.map((foundation) => {
		const founder = profilesMap.get(foundation.founder_id)
		const sourceLocale = (foundation.source_locale as SupportedLocale) ?? 'en'
		const localized = resolveFoundationFields(
			{
				name: foundation.name,
				description: foundation.description,
				story: foundation.story,
				mission: foundation.mission,
				vision: foundation.vision,
				impactHighlights: foundation.impact_highlights ?? [],
			},
			sourceLocale,
			translations.get(foundation.id),
			options,
		)

		return {
			id: foundation.id,
			name: localized.name ?? foundation.name,
			slug: foundation.slug,
			description: localized.description ?? foundation.description,
			story: localized.story ?? foundation.story,
			impactHighlights: localized.impactHighlights ?? foundation.impact_highlights ?? [],
			logoUrl: foundation.logo_url,
			coverImageUrl: foundation.cover_image_url,
			founderId: foundation.founder_id,
			foundedYear: foundation.founded_year,
			mission: localized.mission ?? foundation.mission,
			vision: localized.vision ?? foundation.vision,
			websiteUrl: foundation.website_url,
			socialLinks: foundation.social_links as Record<string, string>,
			sourceLocale,
			totalDonationsReceived: Number(foundation.total_donations_received || 0),
			totalCampaignsCompleted: foundation.total_campaigns_completed || 0,
			totalCampaignsOpen: foundation.total_campaigns_open || 0,
			createdAt: foundation.created_at,
			updatedAt: foundation.updated_at,
			founder: founder
				? {
						id: founder.id,
						displayName: founder.display_name,
						imageUrl: founder.image_url,
						slug: founder.slug,
					}
				: null,
		}
	})
}
