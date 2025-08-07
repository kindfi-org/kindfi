import type { TypedSupabaseClient } from '@packages/lib/types'
import { getProjectIdTitleAndCategoryBySlug } from './get-project-id-title-and-category-by-slug'
import { getProjectPitch } from './get-project-pitch'

export async function getProjectPitchDataBySlug(
	client: TypedSupabaseClient,
	slug: string,
) {
	// Get project ID and category
	const { id, title, category } = await getProjectIdTitleAndCategoryBySlug(
		client,
		slug,
	)

	// Get pitch data using the ID
	const pitch = await getProjectPitch(client, id)

	return {
		id,
		title,
		slug,
		category,
		pitch,
	}
}
