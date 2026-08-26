import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { projectPitchFormSchema } from '~/lib/schemas/project.schemas'
import { upsertManualTranslation } from '~/lib/services/content-translation/server'
import {
	deleteFolderFromBucket,
	transformToEmbedUrl,
	uploadPitchDeck,
} from '~/lib/utils/project-utils'
import { validateRequest } from '~/lib/utils/validation'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback
	try {
		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug: projectSlug } = await params
		const formPayload = {
			projectId: formData.get('projectId') as string,
			projectSlug,
			title: formData.get('title') as string,
			story: formData.get('story') as string,
			videoUrl: (formData.get('videoUrl') as string) || null,
			pitchDeck: formData.get('pitchDeck') as File | null,
			removePitchDeck: formData.get('removePitchDeck') === 'true',
			translation: safeJsonParse(formData.get('translation') as string | null, undefined),
		}
		const validation = validateRequest(projectPitchFormSchema, formPayload)
		if (!validation.success) return validation.response
		const {
			projectId,
			projectSlug: validatedSlug,
			title,
			story,
			videoUrl: rawVideoUrl,
			pitchDeck,
			removePitchDeck,
			translation,
		} = validation.data

		// Verify user has permission to update this project
		// Check if user is the project owner or has editor role in parallel
		const [projectResult, memberResult] = await Promise.all([
			supabaseServiceRole
				.from('projects')
				.select('id, kindler_id, source_locale')
				.eq('id', projectId)
				.single(),
			supabaseServiceRole
				.from('project_members')
				.select('role')
				.eq('project_id', projectId)
				.eq('user_id', userId)
				.in('role', ['core', 'admin', 'editor'])
				.single(),
		])

		const { data: project, error: projectError } = projectResult
		const { data: memberData } = memberResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Check if user is the project owner
		const isOwner = project.kindler_id === userId
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
		const videoUrl = rawVideoUrl ? transformToEmbedUrl(rawVideoUrl) : null

		const projectPitchData: TablesInsert<'project_pitch'> = {
			project_id: projectId,
			title,
			story,
			video_url: videoUrl,
		}

		if (pitchDeck instanceof File) {
			projectPitchData.pitch_deck =
				(await uploadPitchDeck(validatedSlug, pitchDeck, supabase)) ?? undefined
		} else if (removePitchDeck) {
			// Remove pitch deck from the database
			projectPitchData.pitch_deck = null

			try {
				// Delete all files in the project's pitch deck folder
				await deleteFolderFromBucket(supabase, 'project_pitch_decks', validatedSlug)
			} catch (e) {
				logger.warn('Failed to cleanup pitch deck folder:', (e as Error).message)
			}
		}

		const { error } = await supabase
			.from('project_pitch')
			.upsert(projectPitchData, { onConflict: 'project_id' })

		if (error) {
			logger.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		const { data: pitchRow, error: pitchFetchError } = await supabase
			.from('project_pitch')
			.select('id')
			.eq('project_id', projectId)
			.single()

		if (pitchFetchError || !pitchRow) {
			logger.error('Failed to load pitch id after upsert', pitchFetchError)
		} else if (translation) {
			const sourceLocale =
				((project as { source_locale?: string }).source_locale as 'en' | 'es' | undefined) ?? 'en'
			await upsertManualTranslation('project_pitch', pitchRow.id, sourceLocale, translation)
		}

		return NextResponse.json({
			message: 'Project story saved successfully',
		})
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
