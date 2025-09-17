import type { TypedSupabaseClient } from '@packages/lib/types'
import { getProjectIdTitleAndCategoryBySlug } from './get-project-id-title-and-category-by-slug'

export async function getProjectMembersDataBySlug(
	client: TypedSupabaseClient,
	slug: string,
) {
	// Get project ID and category
	const { id, title, category } = await getProjectIdTitleAndCategoryBySlug(
		client,
		slug,
	)

	// Get current authenticated user id (works with browser/server Supabase client)
	// If auth is not available on this client type, currentUserId will be null.
	let currentUserId: string | null = null
	try {
		const { data } = await client.auth.getUser()
		currentUserId = data?.user?.id ?? null
	} catch {
		currentUserId = null
	}

	// Members for this project
	const { data: members, error: membersError } = await client
		.from('project_members')
		.select('id, role, title, user_id, joined_at')
		.eq('project_id', id)

	if (membersError) throw membersError

	// Early return if no members
	if (!members || members.length === 0) {
		return {
			id,
			title,
			slug,
			category,
			currentUserId,
			team: [],
		}
	}

	// Profiles for the collected user_ids
	const userIds = Array.from(new Set(members.map((m) => m.user_id)))
	const { data: profiles, error: profilesError } = await client
		.from('profiles')
		.select('id, display_name, email, image_url')
		.in('id', userIds)

	if (profilesError) throw profilesError

	// Merge members + profiles
	const profilesById = new Map((profiles ?? []).map((p) => [p.id, p] as const))
	const team = members.map((m) => {
		const profile = profilesById.get(m.user_id)
		return {
			id: m.id,
			userId: m.user_id,
			role: m.role,
			title: m.title,
			joinedAt: m.joined_at,
			displayName: profile?.display_name ?? null,
			email: profile?.email ?? null,
			avatar: profile?.image_url ?? null,
		}
	})

	return { id, title, slug, category, currentUserId, team }
}
