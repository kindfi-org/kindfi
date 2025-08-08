import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { transformToEmbedUrl, uploadPitchDeck } from '~/lib/utils/project-utils'

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const supabase = await createSupabaseServerClient()
		const formData = await req.formData()

		const { slug: projectSlug } = await params
		const projectId = formData.get('projectId') as string
		const title = formData.get('title') as string
		const story = formData.get('story') as string
		const rawVideoUrl = formData.get('videoUrl') as string | null
		const videoUrl = rawVideoUrl ? transformToEmbedUrl(rawVideoUrl) : null
		const pitchDeck = formData.get('pitchDeck') as File | string | null

		if (!projectId || !projectSlug || !title || !story) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			)
		}

		if (!projectId) {
			return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
		}

		let pitchDeckUrl: string | null = null
		if (pitchDeck instanceof File) {
			pitchDeckUrl = await uploadPitchDeck(projectSlug, pitchDeck, supabase)
		} else if (typeof pitchDeck === 'string') {
			pitchDeckUrl = pitchDeck.trim()
		}

		// Check if there's already a pitch for this project
		const { data: existingPitch } = await supabase
			.from('project_pitch')
			.select('id')
			.eq('project_id', projectId)
			.single()

		const payload = {
			title,
			story,
			video_url: videoUrl,
			pitch_deck: pitchDeckUrl,
			project_id: projectId,
		}

		const result = existingPitch
			? await supabase
					.from('project_pitch')
					.update(payload)
					.eq('project_id', projectId)
			: await supabase.from('project_pitch').insert(payload)

		if (result.error) {
			console.error(result.error)
			return NextResponse.json({ error: result.error.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Project pitch upserted successfully',
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
