import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	teamMemberCreateSchema,
	teamMemberUpdateSchema,
	teamMemberDeleteQuerySchema,
} from '~/lib/schemas/project.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug: _projectSlug } = await params
		const body = await req.json()
		const validation = validateRequest(teamMemberCreateSchema, body)
		if (!validation.success) return validation.response
		const { projectId, fullName, roleTitle, bio, photoUrl, yearsInvolved } =
			validation.data

		// Verify user has permission and get max order_index in parallel
		const [projectResult, memberResult, existingTeamResult] = await Promise.all(
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
					.in('role', ['core', 'admin', 'editor'])
					.single(),
				supabaseServiceRole
					.from('project_team')
					.select('order_index')
					.eq('project_id', projectId)
					.order('order_index', { ascending: false })
					.limit(1)
					.single(),
			],
		)

		const { data: project, error: projectError } = projectResult
		const { data: memberData } = memberResult
		const { data: existingTeam } = existingTeamResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const isOwner = project.kindler_id === userId
		const hasEditorRole = !!memberData

		if (!isOwner && !hasEditorRole) {
			return NextResponse.json(
				{
					error:
						'Forbidden: You do not have permission to manage this project team',
				},
				{ status: 403 },
			)
		}

		const nextOrderIndex = existingTeam?.order_index
			? existingTeam.order_index + 1
			: 0

		// Insert new team member
		const insertData: TablesInsert<'project_team'> = {
			project_id: projectId,
			full_name: fullName,
			role_title: roleTitle,
			bio: bio?.trim() || null,
			photo_url: photoUrl?.trim() || null,
			years_involved: yearsInvolved || null,
			order_index: nextOrderIndex,
		}

		const { data: newMember, error: insertError } = await supabaseServiceRole
			.from('project_team')
			.insert(insertData)
			.select()
			.single()

		if (insertError) {
			console.error(insertError)
			return NextResponse.json({ error: insertError.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Team member added successfully',
			member: {
				id: newMember.id,
				projectId: newMember.project_id,
				fullName: newMember.full_name,
				roleTitle: newMember.role_title,
				bio: newMember.bio,
				photoUrl: newMember.photo_url,
				yearsInvolved: newMember.years_involved,
				orderIndex: newMember.order_index,
				createdAt: newMember.created_at,
				updatedAt: newMember.updated_at,
			},
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug: _projectSlug } = await params
		const body = await req.json()
		const validation = validateRequest(teamMemberUpdateSchema, body)
		if (!validation.success) return validation.response
		const {
			projectId,
			memberId,
			fullName,
			roleTitle,
			bio,
			photoUrl,
			yearsInvolved,
			orderIndex,
		} = validation.data

		// Verify user has permission in parallel
		const [projectResult, memberResult] = await Promise.all([
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
				.in('role', ['core', 'admin', 'editor'])
				.single(),
		])

		const { data: project, error: projectError } = projectResult
		const { data: memberData, error: memberError } = memberResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		if (memberError && memberError.code !== 'PGRST116') {
			console.error('Error checking user permissions:', memberError)
		}

		const isOwner = project.kindler_id === userId
		const hasEditorRole = !!memberData

		if (!isOwner && !hasEditorRole) {
			return NextResponse.json(
				{
					error:
						'Forbidden: You do not have permission to manage this project team',
				},
				{ status: 403 },
			)
		}

		// Build update data
		const updateData: TablesUpdate<'project_team'> = {}
		if (fullName !== undefined) updateData.full_name = fullName?.trim() ?? null
		if (roleTitle !== undefined) updateData.role_title = roleTitle?.trim() ?? null
		if (bio !== undefined) updateData.bio = bio?.trim() || null
		if (photoUrl !== undefined) updateData.photo_url = photoUrl?.trim() || null
		if (yearsInvolved !== undefined)
			updateData.years_involved = yearsInvolved || null
		if (orderIndex !== undefined) updateData.order_index = orderIndex

		const { data: updatedMember, error: updateError } =
			await supabaseServiceRole
				.from('project_team')
				.update(updateData)
				.eq('id', memberId)
				.eq('project_id', projectId)
				.select()
				.single()

		if (updateError) {
			console.error(updateError)
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Team member updated successfully',
			member: {
				id: updatedMember.id,
				projectId: updatedMember.project_id,
				fullName: updatedMember.full_name,
				roleTitle: updatedMember.role_title,
				bio: updatedMember.bio,
				photoUrl: updatedMember.photo_url,
				yearsInvolved: updatedMember.years_involved,
				orderIndex: updatedMember.order_index,
				createdAt: updatedMember.created_at,
				updatedAt: updatedMember.updated_at,
			},
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
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug: _projectSlug } = await params
		const { searchParams } = new URL(req.url)
		const queryData = {
			projectId: searchParams.get('projectId'),
			memberId: searchParams.get('memberId'),
		}
		const validation = validateRequest(teamMemberDeleteQuerySchema, queryData)
		if (!validation.success) return validation.response
		const { projectId, memberId } = validation.data

		// Verify user has permission in parallel
		const [projectResult, memberResult] = await Promise.all([
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
				.in('role', ['core', 'admin', 'editor'])
				.single(),
		])

		const { data: project, error: projectError } = projectResult
		const { data: memberData, error: memberError } = memberResult

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		if (memberError && memberError.code !== 'PGRST116') {
			console.error('Error checking user permissions:', memberError)
		}

		const isOwner = project.kindler_id === userId
		const hasEditorRole = !!memberData

		if (!isOwner && !hasEditorRole) {
			return NextResponse.json(
				{
					error:
						'Forbidden: You do not have permission to manage this project team',
				},
				{ status: 403 },
			)
		}

		const { error: deleteError } = await supabaseServiceRole
			.from('project_team')
			.delete()
			.eq('id', memberId)
			.eq('project_id', projectId)

		if (deleteError) {
			console.error(deleteError)
			return NextResponse.json({ error: deleteError.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Team member removed successfully',
		})
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
