import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getProjectIdTitleAndCategoryBySlug(
	client: TypedSupabaseClient,
	slug: string,
) {
	const { data, error } = await client
		.from('projects')
		.select('id, title, category:category_id(*)')
		.eq('slug', slug)
		.single()

	if (error) throw error
	if (!data) throw new Error(`Project with slug '${slug}' not found`)

	return {
		id: data.id,
		title: data.title,
		category: data.category,
	}
}
