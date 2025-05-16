import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getProjectTeam(
	client: TypedSupabaseClient,
	projectId: string,
) {
	const { data: members, error: membersError } = await client
		.from('project_members')
		.select('id, role, title, user_id')
		.eq('project_id', projectId)

	if (membersError) throw membersError

	const userIds = members.map((m) => m.user_id)
	const { data: profiles, error: profilesError } = await client
		.from('profiles')
		.select('id, display_name, bio, image_url')
		.in('id', userIds)

	if (profilesError) throw profilesError

	return members.flatMap((m) => {
		const profile = profiles.find((p) => p.id === m.user_id)
		if (!profile) return []
		return [
			{
				id: m.id,
				displayName: profile.display_name,
				avatar: profile.image_url,
				bio: profile.bio,
				role: m.role,
				title: m.title,
			},
		]
	})
}
