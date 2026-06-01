import type { TypedSupabaseClient } from '@packages/lib/types'

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

export async function getAllFoundations(
	client: TypedSupabaseClient,
	sortSlug = 'most-recent',
	limit?: number,
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
      logo_url,
      cover_image_url,
      founder_id,
      founded_year,
      mission,
      vision,
      website_url,
      social_links,
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

	// Fetch profiles separately since founder_id references users.id, not profiles.id
	const founderIds = [...new Set(data.map((f) => f.founder_id))]
	const { data: profilesData } = await client
		.from('profiles')
		.select('id, display_name, image_url, slug')
		.in('id', founderIds)

	const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]))

	return data.map((foundation) => {
		const founder = profilesMap.get(foundation.founder_id)

		return {
			id: foundation.id,
			name: foundation.name,
			slug: foundation.slug,
			description: foundation.description,
			logoUrl: foundation.logo_url,
			coverImageUrl: foundation.cover_image_url,
			founderId: foundation.founder_id,
			foundedYear: foundation.founded_year,
			mission: foundation.mission,
			vision: foundation.vision,
			websiteUrl: foundation.website_url,
			socialLinks: foundation.social_links as Record<string, string>,
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
