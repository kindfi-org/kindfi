import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { highlightsUpdateSchema } from '~/lib/schemas/project.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(
	req: Request,
	_params: { params: Promise<{ slug: string }> },
) {
	try {
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(highlightsUpdateSchema, body)
		if (!validation.success) return validation.response
		const { projectId, highlights } = validation.data

		// Verify user has permission to update this project
		// Check if user is the project owner or has editor role in parallel
		const [projectResult, memberResult] = await Promise.all([
			supabaseServiceRole
				.from('projects')
				.select('id, kindler_id, metadata')
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

		// Use service role client for project update with manual authorization check
		const supabase = supabaseServiceRole

		// Prepare highlights data (remove client-side IDs, keep only title and description)
		const highlightsData = highlights.map((h) => ({
			title: h.title,
			description: h.description,
		}))

		// Merge with existing metadata, preserving other metadata fields
		const currentMetadata = (project.metadata as Record<string, unknown>) || {}
		const updatedMetadata = {
			...currentMetadata,
			highlights: highlightsData,
		}

		// Update the project metadata
		const updateData: TablesUpdate<'projects'> = {
			metadata: updatedMetadata,
		}

		const { error: updateError } = await supabase
			.from('projects')
			.update(updateData)
			.eq('id', projectId)

		if (updateError) {
			console.error(updateError)
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Highlights saved successfully',
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
