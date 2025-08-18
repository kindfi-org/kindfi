import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getProjectPitch(
	client: TypedSupabaseClient,
	projectId: string,
) {
	const { data, error } = await client
		.from('project_pitch')
		.select('title, story, pitch_deck, video_url')
		.eq('project_id', projectId)
		.single()

	if (error && error.code !== 'PGRST116') throw error

	return data
		? {
				title: data.title,
				story: data.story,
				pitchDeck: data.pitch_deck,
				videoUrl: data.video_url,
			}
		: {
				title: '',
				story: '',
				pitchDeck: null,
				videoUrl: null,
			}
}
