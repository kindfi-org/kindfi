import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import {
	deleteFolderFromBucket,
	transformToEmbedUrl,
	uploadPitchDeck,
} from '~/lib/utils/project-utils'

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
		const removePitchDeck = formData.get('removePitchDeck') === 'true'

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

		const projectPitchData: TablesInsert<'project_pitch'> = {
			project_id: projectId,
			title,
			story,
			video_url: videoUrl,
		}

		if (pitchDeck instanceof File) {
			projectPitchData.pitch_deck =
				(await uploadPitchDeck(projectSlug, pitchDeck, supabase)) ?? undefined
		} else if (removePitchDeck) {
			// Remove pitch deck from the database
			projectPitchData.pitch_deck = null

			try {
				// Delete all files in the project's pitch deck folder
				await deleteFolderFromBucket(
					supabase,
					'project_pitch_decks',
					projectSlug,
				)
			} catch (e) {
				console.warn(
					'Failed to cleanup pitch deck folder:',
					(e as Error).message,
				)
			}
		}

		const { error } = await supabase
			.from('project_pitch')
			.upsert(projectPitchData, { onConflict: 'project_id' })

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
