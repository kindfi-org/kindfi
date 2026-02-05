import type { TypedSupabaseClient } from '@packages/lib/types'

interface Highlight {
	id: string
	title: string
	description: string
}

export async function getProjectHighlights(
	client: TypedSupabaseClient,
	projectSlug: string,
): Promise<{ projectId: string; highlights: Highlight[] } | null> {
	const { data: project, error } = await client
		.from('projects')
		.select('id, metadata')
		.eq('slug', projectSlug)
		.single()

	if (error) throw error
	if (!project) return null

	// Extract highlights from metadata
	const metadata = (project.metadata as Record<string, unknown>) || {}
	const highlightsData = metadata.highlights as
		| Array<{ title: string; description: string }>
		| undefined

	// Convert to Highlight format with stable IDs based on content hash
	const highlights: Highlight[] =
		highlightsData?.map((h, index) => {
			// Create a stable ID based on index and content hash
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
