import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getUserFoundations(
	client: TypedSupabaseClient,
	userId: string,
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
			total_donations_received,
			total_campaigns_completed,
			total_campaigns_open,
			created_at
		`,
		)
		.eq('founder_id', userId)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (
		data?.map((foundation) => ({
			id: foundation.id,
			name: foundation.name,
			slug: foundation.slug,
			description: foundation.description,
			logoUrl: foundation.logo_url,
			coverImageUrl: foundation.cover_image_url,
			totalDonationsReceived: Number(foundation.total_donations_received || 0),
			totalCampaignsCompleted: foundation.total_campaigns_completed || 0,
			totalCampaignsOpen: foundation.total_campaigns_open || 0,
			createdAt: foundation.created_at,
		})) ?? []
	)
}
