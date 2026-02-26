import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { Enums, TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

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
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug } = await params

		const projectId = formData.get('projectId') as string
		const memberId = formData.get('memberId') as string
		const role = formData.get('role') as string | null
		const title = (formData.get('title') as string | null) ?? null

		// Validate required fields
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

		// Verify user has permission to update project members
		// Check if user is the project owner or has admin/core role
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

		// Check if user is a project member with admin/core role
		const { data: memberData } = await supabaseServiceRole
			.from('project_members')
			.select('role')
			.eq('project_id', projectId)
			.eq('user_id', userId)
			.in('role', ['core', 'admin'])
			.single()

		const hasAdminRole = !!memberData

		// Also check if user is updating their own membership (allowed for non-privileged role changes)
		const { data: targetMember } = await supabaseServiceRole
			.from('project_members')
			.select('user_id, role')
			.eq('id', memberId)
			.eq('project_id', projectId)
			.single()

		const isUpdatingSelf = targetMember?.user_id === userId

		// Allow update if:
		// 1. User is project owner or admin/core member (can update anyone)
		// 2. User is updating themselves (can update own membership, but role changes are restricted)
		if (!isOwner && !hasAdminRole && !isUpdatingSelf) {
			return NextResponse.json(
				{
					error: 'Forbidden: You do not have permission to update this member',
				},
				{ status: 403 },
			)
		}

		// If user is updating themselves and trying to change role to a privileged one, deny
		if (isUpdatingSelf && !isOwner && !hasAdminRole && role) {
			if (['core', 'admin', 'editor'].includes(role)) {
				return NextResponse.json(
					{ error: 'Forbidden: You cannot assign yourself a privileged role' },
					{ status: 403 },
				)
			}
		}

		// Use service role client for member update with manual authorization check
		const supabase = supabaseServiceRole

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
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const { slug } = await params

		const projectId = formData.get('projectId') as string
		const memberId = formData.get('memberId') as string

		// Validate required fields
		const missing = listMissing({ projectId, memberId })
		if (missing.length > 0) {
			return NextResponse.json(
				{ error: `Missing required fields: ${missing.join(', ')}` },
				{ status: 400 },
			)
		}

		// Verify user has permission to delete project members
		// Check if user is the project owner or has admin/core role
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

		// Check if user is a project member with admin/core role
		const { data: memberData } = await supabaseServiceRole
			.from('project_members')
			.select('role')
			.eq('project_id', projectId)
			.eq('user_id', userId)
			.in('role', ['core', 'admin'])
			.single()

		const hasAdminRole = !!memberData

		// Also check if user is deleting their own membership (allowed)
		const { data: targetMember } = await supabaseServiceRole
			.from('project_members')
			.select('user_id')
			.eq('id', memberId)
			.eq('project_id', projectId)
			.single()

		const isDeletingSelf = targetMember?.user_id === userId

		// Allow delete if:
		// 1. User is project owner or admin/core member (can delete anyone)
		// 2. User is deleting themselves (can remove own membership)
		if (!isOwner && !hasAdminRole && !isDeletingSelf) {
			return NextResponse.json(
				{
					error: 'Forbidden: You do not have permission to remove this member',
				},
				{ status: 403 },
			)
		}

		// Use service role client for member deletion with manual authorization check
		const supabase = supabaseServiceRole

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
