import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
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
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug: projectSlug } = await params
		const projectId = formData.get('projectId') as string

		// Verify user has permission to update this project
		// Check if user is the project owner or has editor role
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Check if user is the project owner
		const isOwner = project.kindler_id === userId

		// Check if user is a project member with editor role
		const { data: memberData } = await supabaseServiceRole
			.from('project_members')
			.select('role')
			.eq('project_id', projectId)
			.eq('user_id', userId)
			.in('role', ['core', 'admin', 'editor'])
			.single()

		const hasEditorRole = !!memberData

		if (!isOwner && !hasEditorRole) {
			return NextResponse.json(
				{
					error: 'Forbidden: You do not have permission to update this project',
				},
				{ status: 403 },
			)
		}

		// Use service role client for pitch update with manual authorization check
		// This bypasses RLS but we've already verified the user has permission
		const supabase = supabaseServiceRole

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
