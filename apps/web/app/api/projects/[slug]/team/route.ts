import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import type {
	CreateTeamMemberData,
	UpdateTeamMemberData,
} from '~/lib/types/project/project-team.types'

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
		const body: CreateTeamMemberData & { projectId: string } = await req.json()
		const { projectId, fullName, roleTitle, bio, photoUrl, yearsInvolved } =
			body

		// Validate required fields
		if (!projectId || !fullName?.trim() || !roleTitle?.trim()) {
			return NextResponse.json(
				{
					error: 'Missing required fields: projectId, fullName, and roleTitle',
				},
				{ status: 400 },
			)
		}

		// Verify user has permission
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const isOwner = project.kindler_id === userId

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
					error:
						'Forbidden: You do not have permission to manage this project team',
				},
				{ status: 403 },
			)
		}

		// Get current max order_index
		const { data: existingTeam } = await supabaseServiceRole
			.from('project_team')
			.select('order_index')
			.eq('project_id', projectId)
			.order('order_index', { ascending: false })
			.limit(1)
			.single()

		const nextOrderIndex = existingTeam?.order_index
			? existingTeam.order_index + 1
			: 0

		// Insert new team member
		const insertData: TablesInsert<'project_team'> = {
			project_id: projectId,
			full_name: fullName.trim(),
			role_title: roleTitle.trim(),
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
		const body: UpdateTeamMemberData & { projectId: string; memberId: string } =
			await req.json()
		const {
			projectId,
			memberId,
			fullName,
			roleTitle,
			bio,
			photoUrl,
			yearsInvolved,
			orderIndex,
		} = body

		if (!projectId || !memberId) {
			return NextResponse.json(
				{ error: 'Missing required fields: projectId and memberId' },
				{ status: 400 },
			)
		}

		// Verify user has permission
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const isOwner = project.kindler_id === userId

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
					error:
						'Forbidden: You do not have permission to manage this project team',
				},
				{ status: 403 },
			)
		}

		// Build update data
		const updateData: TablesUpdate<'project_team'> = {}
		if (fullName !== undefined) updateData.full_name = fullName.trim()
		if (roleTitle !== undefined) updateData.role_title = roleTitle.trim()
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
		const projectId = searchParams.get('projectId')
		const memberId = searchParams.get('memberId')

		if (!projectId || !memberId) {
			return NextResponse.json(
				{ error: 'Missing required query parameters: projectId and memberId' },
				{ status: 400 },
			)
		}

		// Verify user has permission
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const isOwner = project.kindler_id === userId

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
