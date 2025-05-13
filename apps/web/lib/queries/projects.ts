import type { TypedSupabaseClient } from '@packages/lib/types'
import { sortMap } from '~/lib/constants/projects'

export async function getAllProjects(
	client: TypedSupabaseClient,
	categorySlugs: string[] = [],
	sortSlug = 'most-popular',
) {
	const { column, ascending } = sortMap[sortSlug] ?? sortMap['most-popular']

	let query = client
		.from('projects')
		.select(
			`
      id,
      title,
      description,
      image_url,
      created_at,
      current_amount,
      target_amount,
      min_investment,
      percentage_complete,
      investors_count,
      category:category_id ( * ),
      project_tag_relationships (
				tag:tag_id ( id, name, color )
			)
    `,
		)
		.order(column, { ascending })

	if (categorySlugs.length > 0) {
		const { data: categories, error: catErr } = await client
			.from('categories')
			.select('id')
			.in('slug', categorySlugs)

		if (catErr) throw catErr
		const categoryIds = categories?.map((c) => c.id) ?? []

		if (categoryIds.length > 0) {
			query = query.in('category_id', categoryIds)
		}
	}

	const { data, error } = await query

	if (error) throw error

	console.log(data)

	return (
		data?.map((project) => ({
			id: project.id,
			title: project.title,
			description: project.description,
			image: project.image_url,
			goal: project.target_amount,
			raised: project.current_amount,
			investors: project.investors_count,
			minInvestment: project.min_investment,
			createdAt: project.created_at,
			category: project.category,
			tags: project.project_tag_relationships.map((r) => r.tag),
		})) ?? []
	)
}

export async function getAllCategories(client: TypedSupabaseClient) {
	const { data, error } = await client
		.from('categories')
		.select('*')
		.order('name', { ascending: true })

	if (error) throw error

	console.log(data)

	return data
}

export async function getProjectById(
	client: TypedSupabaseClient,
	projectId: string,
) {
	// Fetch the project by ID, including its category and tags
	const { data: project, error: projectError } = await client
		.from('projects')
		.select(
			`
      id,
      title,
      description,
      image_url,
      created_at,
      current_amount,
      target_amount,
      min_investment,
      percentage_complete,
      investors_count,
      category:category_id ( * ),
      project_tag_relationships (
        tag:tag_id ( id, name, color )
      )
    `,
		)
		.eq('id', projectId)
		.single()

	if (projectError) throw projectError
	if (!project) return null

	// Fetch the related pitch (if it exists)
	const { data: pitch, error: pitchError } = await client
		.from('project_pitch')
		.select('id, title, story, pitch_deck, video_url')
		.eq('project_id', projectId)
		.single()

	// Ignore "no rows found" error (code PGRST116)
	if (pitchError && pitchError.code !== 'PGRST116') throw pitchError

	console.log(pitch)

	// Fetch project members and match with profiles
	const { data: members, error: membersError } = await client
		.from('project_members')
		.select('id, role, title, user_id')
		.eq('project_id', projectId)

	if (membersError) throw membersError

	console.log(members)

	const userIds = members.map((m) => m.user_id)
	console.log(userIds)
	const { data: profiles, error: profilesError } = await client
		.from('profiles')
		.select('id, display_name, bio, image_url')
		.in('id', userIds)

	if (profilesError) throw profilesError

	console.log(profiles)

	const team = members.flatMap((m) => {
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

	console.log(team)

	// Return the normalized project object
	return {
		id: project.id,
		title: project.title,
		description: project.description,
		image: project.image_url,
		goal: project.target_amount,
		raised: project.current_amount,
		investors: project.investors_count,
		minInvestment: project.min_investment,
		createdAt: project.created_at,
		category: project.category,
		tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
		pitch: {
			id: pitch?.id ?? '',
			title: pitch?.title ?? '',
			story: pitch?.story ?? null,
			pitchDeck: pitch?.pitch_deck ?? null,
			videoUrl: pitch?.video_url ?? null,
		},
		team,
	}
}
