import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeProjectManage } from '~/lib/api/authorize-project-manage'
import { createTeamMemberRecord, deleteTeamMemberRecord } from '~/lib/api/team-member-service'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	teamMemberCreateSchema,
	teamMemberDeleteQuerySchema,
	teamMemberUpdateSchema,
} from '~/lib/schemas/project.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
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

		const auth = await authorizeProjectManage(userId, validation.data.projectId)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('kindler_id')
			.eq('id', validation.data.projectId)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const result = await createTeamMemberRecord({
			entityId: validation.data.projectId,
			entityColumn: 'project_id',
			teamTable: 'project_team',
			membersTable: 'project_members',
			ownerUserId: project.kindler_id,
			type: validation.data.type,
			fullName: validation.data.type === 'manual' ? validation.data.fullName : undefined,
			roleTitle: validation.data.roleTitle,
			bio: validation.data.bio,
			photoUrl: validation.data.type === 'manual' ? validation.data.photoUrl : undefined,
			yearsInvolved: validation.data.type === 'manual' ? validation.data.yearsInvolved : undefined,
			userId: validation.data.type === 'registered' ? validation.data.userId : undefined,
		})

		if ('error' in result) {
			return NextResponse.json({ error: result.error }, { status: result.status })
		}

		return NextResponse.json(
			{
				message: 'Team member added successfully',
				member: {
					id: result.member.id,
					projectId: result.member.entityId,
					userId: result.member.userId,
					fullName: result.member.fullName,
					roleTitle: result.member.roleTitle,
					bio: result.member.bio,
					photoUrl: result.member.photoUrl,
					yearsInvolved: result.member.yearsInvolved,
					orderIndex: result.member.orderIndex,
					isManager: result.member.isManager,
					createdAt: result.member.createdAt,
					updatedAt: result.member.updatedAt,
				},
			},
			{ status: result.status },
		)
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
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
		const { projectId, memberId, fullName, roleTitle, bio, photoUrl, yearsInvolved, orderIndex } =
			validation.data

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		const updateData: Record<string, unknown> = {}
		if (fullName !== undefined) updateData.full_name = fullName?.trim() ?? null
		if (roleTitle !== undefined) updateData.role_title = roleTitle?.trim() ?? null
		if (bio !== undefined) updateData.bio = bio?.trim() || null
		if (photoUrl !== undefined) updateData.photo_url = photoUrl?.trim() || null
		if (yearsInvolved !== undefined) updateData.years_involved = yearsInvolved || null
		if (orderIndex !== undefined) updateData.order_index = orderIndex

		const { data: updatedMember, error: updateError } = await supabaseServiceRole
			.from('project_team')
			.update(updateData)
			.eq('id', memberId)
			.eq('project_id', projectId)
			.select()
			.single()

		if (updateError) {
			logger.error(updateError)
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Team member updated successfully',
			member: {
				id: updatedMember.id,
				projectId: updatedMember.project_id,
				userId: updatedMember.user_id,
				fullName: updatedMember.full_name,
				roleTitle: updatedMember.role_title,
				bio: updatedMember.bio,
				photoUrl: updatedMember.photo_url,
				yearsInvolved: updatedMember.years_involved,
				orderIndex: updatedMember.order_index,
				isManager: Boolean(updatedMember.user_id),
				createdAt: updatedMember.created_at,
				updatedAt: updatedMember.updated_at,
			},
		})
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug: _projectSlug } = await params
		const { searchParams } = new URL(req.url)
		const validation = validateRequest(teamMemberDeleteQuerySchema, {
			projectId: searchParams.get('projectId'),
			memberId: searchParams.get('memberId'),
		})
		if (!validation.success) return validation.response
		const { projectId, memberId } = validation.data

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		const result = await deleteTeamMemberRecord({
			entityId: projectId,
			entityColumn: 'project_id',
			teamTable: 'project_team',
			membersTable: 'project_members',
			memberId,
		})

		if ('error' in result) {
			return NextResponse.json({ error: result.error }, { status: result.status })
		}

		return NextResponse.json({ message: 'Team member removed successfully' })
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
