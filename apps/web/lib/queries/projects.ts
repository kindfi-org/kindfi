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
