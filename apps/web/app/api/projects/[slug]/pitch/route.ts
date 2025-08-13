import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesInsert } from '@services/supabase'
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
		const pitchDeck = formData.get('pitchDeck') as File | null

		// Single guard clause that also reports which required fields are missing
		const missingFields = Object.entries({
			projectId,
			projectSlug,
			title,
			story,
		})
			.filter(([, v]) => !v)
			.map(([k]) => k)
			.join(', ')
		if (missingFields) {
			return NextResponse.json(
				{ error: `Missing required fields: ${missingFields}` },
				{ status: 400 },
			)
		}

		let pitchDeckUrl: string | undefined
		if (pitchDeck instanceof File) {
			pitchDeckUrl =
				(await uploadPitchDeck(projectSlug, pitchDeck, supabase)) ?? undefined
		}

		const payload: TablesInsert<'project_pitch'> = {
			project_id: projectId,
			title,
			story,
			video_url: videoUrl,
		}

		if (pitchDeckUrl !== undefined) {
			payload.pitch_deck = pitchDeckUrl // set or replace only when provided
		}

		const { error } = await supabase
			.from('project_pitch')
			.upsert(payload, { onConflict: 'project_id' })

		if (error) {
			console.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
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
