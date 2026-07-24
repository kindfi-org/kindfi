import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import { getProjectIdTitleAndCategoryBySlug } from './get-project-id-title-and-category-by-slug'
import { type GetProjectPitchOptions, getProjectPitch } from './get-project-pitch'

export async function getProjectPitchDataBySlug(
	client: TypedSupabaseClient,
	slug: string,
	options?: GetProjectPitchOptions,
) {
	// Get project ID and category
	const { id, title, category } = await getProjectIdTitleAndCategoryBySlug(client, slug)

	const { data: projectRow } = await client
		.from('projects')
		.select('source_locale')
		.eq('id', id)
		.maybeSingle()

	const sourceLocale = (projectRow?.source_locale as SupportedLocale | undefined) ?? 'en'

	// Get pitch data using the ID
	const pitch = await getProjectPitch(client, id, options)

	return {
		id,
		title,
		slug,
		category,
		sourceLocale,
		pitch,
	}
}
