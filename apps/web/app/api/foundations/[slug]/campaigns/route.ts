import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

/**
 * PATCH /api/foundations/[slug]/campaigns
 * Assign or unassign campaigns to/from a foundation
 */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()
		const foundation = await getFoundationBySlug(supabase, slug)

		if (!foundation) {
			return NextResponse.json(
				{ error: 'Foundation not found' },
				{ status: 404 },
			)
		}

		// Verify user is the founder
		if (foundation.founderId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const { projectId, assign } = body

		if (!projectId || typeof assign !== 'boolean') {
			return NextResponse.json(
				{ error: 'projectId and assign (boolean) are required' },
				{ status: 400 },
			)
		}

		// Verify the project belongs to the user
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		if (project.kindler_id !== session.user.id) {
			return NextResponse.json(
				{ error: 'You can only assign your own campaigns' },
				{ status: 403 },
			)
		}

		// Update the project's foundation_id
		const { error: updateError } = await supabaseServiceRole
			.from('projects')
			.update({ foundation_id: assign ? foundation.id : null })
			.eq('id', projectId)

		if (updateError) {
			console.error('Error updating project:', updateError)
			return NextResponse.json(
				{ error: 'Failed to update campaign' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error in PATCH /api/foundations/[slug]/campaigns:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
