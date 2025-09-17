import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Enums, TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'

// Small helper to safely detect missing fields without using eval
function listMissing(fields: Record<string, unknown>) {
	return Object.entries(fields)
		.filter(([, v]) => v == null || (typeof v === 'string' && v.trim() === ''))
		.map(([k]) => k)
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const supabase = await createSupabaseServerClient()

		// Ensure the request is authenticated before processing
		// Returns 401 if there's an auth error or no user present.
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug } = await params

		const projectId = formData.get('projectId') as string
		const memberId = formData.get('memberId') as string
		const role = formData.get('role') as string | null
		const title = (formData.get('title') as string | null) ?? null

		// Validate required fields (no eval)
		const missing = listMissing({ projectId, memberId })
		if (missing.length > 0) {
			return NextResponse.json(
				{ error: `Missing required fields: ${missing.join(', ')}` },
				{ status: 400 },
			)
		}

		// Validate that at least one editable field is present
		if (role == null && title == null) {
			return NextResponse.json(
				{ error: 'Nothing to update. Provide "role" and/or "title".' },
				{ status: 400 },
			)
		}

		// Build update payload
		const updateData: TablesUpdate<'project_members'> = {}
		if (role != null) updateData.role = role as Enums<'project_member_role'>
		if (title != null) updateData.title = title

		// Update the member row scoping also by project_id for safety
		const { data, error } = await supabase
			.from('project_members')
			.update(updateData)
			.eq('id', memberId)
			.eq('project_id', projectId)
			.select('id, user_id, role, title, joined_at')
			.single()

		if (error) {
			console.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Project member updated successfully',
			member: data,
			slug,
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const supabase = await createSupabaseServerClient()

		// Ensure the request is authenticated before processing
		// Returns 401 if there's an auth error or no user present.
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug } = await params

		const projectId = formData.get('projectId') as string
		const memberId = formData.get('memberId') as string

		// Validate required fields (no eval)
		const missing = listMissing({ projectId, memberId })
		if (missing.length > 0) {
			return NextResponse.json(
				{ error: `Missing required fields: ${missing.join(', ')}` },
				{ status: 400 },
			)
		}

		const { error } = await supabase
			.from('project_members')
			.delete()
			.eq('id', memberId)
			.eq('project_id', projectId)

		if (error) {
			console.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Project member removed successfully',
			slug,
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
