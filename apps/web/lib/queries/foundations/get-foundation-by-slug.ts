import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getFoundationBySlug(
	client: TypedSupabaseClient,
	slug: string,
) {
	const { data, error } = await client
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
      updated_at,
      metadata,
      foundation_milestones (
        id,
        title,
        description,
        achieved_date,
        impact_metric,
        metadata
      )
    `,
		)
		.eq('slug', slug)
		.maybeSingle()

	if (error) {
		console.error('Error fetching foundation by slug:', error)
		throw error
	}

	if (!data) {
		return null
	}

	// Fetch profile separately since founder_id references users.id, not profiles.id
	const { data: profileData } = await client
		.from('profiles')
		.select('id, display_name, image_url, slug, bio')
		.eq('id', (data as { founder_id: string }).founder_id)
		.maybeSingle()

	const foundation = data as unknown as {
		id: string
		name: string
		slug: string
		description: string
		logo_url: string | null
		cover_image_url: string | null
		founder_id: string
		founded_year: number
		mission: string | null
		vision: string | null
		website_url: string | null
		social_links: Record<string, string>
		total_donations_received: string
		total_campaigns_completed: number
		total_campaigns_open: number
		created_at: string
		updated_at: string
		metadata: Record<string, unknown>
		profiles: {
			id: string
			display_name: string | null
			image_url: string | null
			slug: string | null
			bio: string | null
		} | null
		foundation_milestones: Array<{
			id: string
			title: string
			description: string | null
			achieved_date: string
			impact_metric: string | null
			metadata: Record<string, unknown>
		}>
	}

	// Fetch escrows separately to avoid complex nested query issues
	const { data: escrowsData } = await client
		.from('foundation_escrows')
		.select(
			`
      escrow_id,
      escrow_contracts:escrow_id (
        id,
        contract_id,
        current_state,
        amount
      )
    `,
		)
		.eq('foundation_id', foundation.id)

	const foundationEscrows = (escrowsData || []) as unknown as Array<{
		escrow_id: string
		escrow_contracts: {
			id: string
			contract_id: string
			current_state: string
			amount: string
		} | null
	}>

	// Fetch campaigns (projects) assigned to this foundation
	const { data: campaignsData } = await client
		.from('projects')
		.select(
			`
			id,
			title,
			slug,
			description,
			image_url,
			current_amount,
			target_amount,
			percentage_complete,
			kinder_count,
			status
		`,
		)
		.eq('foundation_id', foundation.id)
		.order('created_at', { ascending: false })

	const campaigns = (campaignsData ?? []).map((p) => ({
		id: p.id,
		title: p.title,
		slug: p.slug,
		description: p.description,
		imageUrl: p.image_url,
		raised: Number(p.current_amount ?? 0),
		goal: Number(p.target_amount ?? 0),
		percentageComplete: Number(p.percentage_complete ?? 0),
		investors: p.kinder_count ?? 0,
		status: p.status ?? null,
	}))

	const founder = profileData

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
		socialLinks: foundation.social_links,
		totalDonationsReceived: Number(foundation.total_donations_received || 0),
		totalCampaignsCompleted: foundation.total_campaigns_completed || 0,
		totalCampaignsOpen: foundation.total_campaigns_open || 0,
		createdAt: foundation.created_at,
		updatedAt: foundation.updated_at,
		metadata: foundation.metadata,
		founder: founder
			? {
					id: founder.id,
					displayName: founder.display_name,
					imageUrl: founder.image_url,
					slug: founder.slug,
					bio: founder.bio,
				}
			: null,
		milestones: foundation.foundation_milestones.map((m) => ({
			id: m.id,
			title: m.title,
			description: m.description,
			achievedDate: m.achieved_date,
			impactMetric: m.impact_metric,
			metadata: m.metadata,
		})),
		escrows: foundationEscrows
			.map((e) => e.escrow_contracts)
			.filter((e): e is NonNullable<typeof e> => e !== null)
			.map((e) => ({
				id: e.id,
				contractId: e.contract_id,
				currentState: e.current_state,
				amount: Number(e.amount),
			})),
		campaigns,
	}
}
