import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { Enums, TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	projectMemberUpdateFormSchema,
	projectMemberDeleteFormSchema,
} from '~/lib/schemas/project.schemas'
import { validateRequest } from '~/lib/utils/validation'

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

		const formPayload = {
			projectId: formData.get('projectId'),
			memberId: formData.get('memberId'),
			role: formData.get('role'),
			title: formData.get('title'),
		}
		const validation = validateRequest(projectMemberUpdateFormSchema, formPayload)
		if (!validation.success) return validation.response
		const { projectId, memberId, role, title } = validation.data

		// Verify user has permission to update project members
		// Check project, user role, and target member in parallel
		const [projectResult, memberResult, targetMemberResult] = await Promise.all(
			[
				supabaseServiceRole
					.from('projects')
					.select('id, kindler_id')
					.eq('id', projectId)
					.single(),
				supabaseServiceRole
					.from('project_members')
					.select('role')
					.eq('project_id', projectId)
					.eq('user_id', userId)
					.in('role', ['core', 'admin'])
					.single(),
				supabaseServiceRole
					.from('project_members')
					.select('user_id, role')
					.eq('id', memberId)
					.eq('project_id', projectId)
					.single(),
			],
		)

		const { data: project, error: projectError } = projectResult
		const { data: memberData } = memberResult
		const { data: targetMember } = targetMemberResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Check if user is the project owner
		const isOwner = project.kindler_id === userId
		const hasAdminRole = !!memberData
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
			if (['core', 'admin', 'editor'].includes(role as string)) {
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

		const formPayload = {
			projectId: formData.get('projectId'),
			memberId: formData.get('memberId'),
		}
		const validation = validateRequest(projectMemberDeleteFormSchema, formPayload)
		if (!validation.success) return validation.response
		const { projectId, memberId } = validation.data

		// Verify user has permission to delete project members
		// Check project, user role, and target member in parallel
		const [projectResult, memberResult, targetMemberResult] = await Promise.all(
			[
				supabaseServiceRole
					.from('projects')
					.select('id, kindler_id')
					.eq('id', projectId)
					.single(),
				supabaseServiceRole
					.from('project_members')
					.select('role')
					.eq('project_id', projectId)
					.eq('user_id', userId)
					.in('role', ['core', 'admin'])
					.single(),
				supabaseServiceRole
					.from('project_members')
					.select('user_id')
					.eq('id', memberId)
					.eq('project_id', projectId)
					.single(),
			],
		)

		const { data: project, error: projectError } = projectResult
		const { data: memberData } = memberResult
		const { data: targetMember } = targetMemberResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Check if user is the project owner
		const isOwner = project.kindler_id === userId
		const hasAdminRole = !!memberData
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
