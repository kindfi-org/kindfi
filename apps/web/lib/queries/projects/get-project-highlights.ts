import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import { fetchContentTranslation, type LocalizeOptions } from '~/lib/services/content-translation'

interface Highlight {
	id: string
	title: string
	description: string
}

export type GetProjectHighlightsOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getProjectHighlights(
	client: TypedSupabaseClient,
	projectSlug: string,
	options?: GetProjectHighlightsOptions,
): Promise<{ projectId: string; highlights: Highlight[] } | null> {
	const { data: project, error } = await client
		.from('projects')
		.select('id, metadata, source_locale')
		.eq('slug', projectSlug)
		.single()

	if (error) throw error
	if (!project) return null

	const sourceLocale = (project.source_locale as SupportedLocale | undefined) ?? 'en'
	const metadata = (project.metadata as Record<string, unknown>) || {}
	let highlightsData = metadata.highlights as
		| Array<{ title: string; description: string }>
		| undefined

	if (options?.localize !== false) {
		const translation = await fetchContentTranslation(
			client,
			'project',
			project.id,
			options?.viewerLocale ?? 'en',
		)
		const translatedHighlights = (
			translation?.fields as
				| { highlights?: Array<{ title: string; description: string }> }
				| undefined
		)?.highlights

		if (translatedHighlights?.length) {
			highlightsData = translatedHighlights
		}
	}

	const highlights: Highlight[] =
		highlightsData?.map((h, index) => {
			const contentHash = `${h.title}-${h.description}`.slice(0, 20)
			return {
				id: `highlight-${index}-${contentHash.replace(/\s+/g, '-')}`,
				title: h.title || '',
				description: h.description || '',
			}
		}) || []

	return {
		projectId: project.id,
		highlights,
	}
}
