import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

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
		const { projectId, highlights } = body

		// Validate required fields
		if (!projectId || !highlights) {
			return NextResponse.json(
				{ error: 'Missing required fields: projectId and highlights' },
				{ status: 400 },
			)
		}

		// Validate highlights structure
		if (!Array.isArray(highlights)) {
			return NextResponse.json(
				{ error: 'Highlights must be an array' },
				{ status: 400 },
			)
		}

		// Validate minimum highlights requirement
		if (highlights.length < 2) {
			return NextResponse.json(
				{ error: 'At least 2 highlights are required' },
				{ status: 400 },
			)
		}

		// Validate each highlight has required fields
		const invalidHighlights = highlights.filter(
			(h: { title?: string; description?: string }) =>
				!h.title?.trim() || !h.description?.trim(),
		)
		if (invalidHighlights.length > 0) {
			return NextResponse.json(
				{ error: 'All highlights must have a title and description' },
				{ status: 400 },
			)
		}

		// Verify user has permission to update this project
		// Check if user is the project owner or has editor role
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id, metadata')
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

		// Use service role client for project update with manual authorization check
		const supabase = supabaseServiceRole

		// Prepare highlights data (remove client-side IDs, keep only title and description)
		const highlightsData = highlights.map(
			(h: { title: string; description: string }) => ({
				title: h.title.trim(),
				description: h.description.trim(),
			}),
		)

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
