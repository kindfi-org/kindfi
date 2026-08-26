import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeFoundationManage } from '~/lib/api/authorize-foundation-manage'
import { createTeamMemberRecord, deleteTeamMemberRecord } from '~/lib/api/team-member-service'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	foundationSlugParamSchema,
	foundationTeamMemberCreateSchema,
	foundationTeamMemberDeleteQuerySchema,
} from '~/lib/schemas/foundation.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await params
		const slugValidation = validateRequest(foundationSlugParamSchema, { slug })
		if (!slugValidation.success) return slugValidation.response

		const body = await req.json()
		const validation = validateRequest(foundationTeamMemberCreateSchema, body)
		if (!validation.success) return validation.response

		const auth = await authorizeFoundationManage(userId, validation.data.foundationId)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		const { data: foundation, error: foundationError } = await supabaseServiceRole
			.from('foundations')
			.select('founder_id')
			.eq('id', validation.data.foundationId)
			.single()

		if (foundationError || !foundation) {
			return NextResponse.json({ error: 'Foundation not found' }, { status: 404 })
		}

		const result = await createTeamMemberRecord({
			entityId: validation.data.foundationId,
			entityColumn: 'foundation_id',
			teamTable: 'foundation_team',
			membersTable: 'foundation_members',
			ownerUserId: foundation.founder_id,
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
					foundationId: result.member.entityId,
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

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug: _slug } = await params
		const { searchParams } = new URL(req.url)
		const validation = validateRequest(foundationTeamMemberDeleteQuerySchema, {
			foundationId: searchParams.get('foundationId'),
			memberId: searchParams.get('memberId'),
		})
		if (!validation.success) return validation.response
		const { foundationId, memberId } = validation.data

		const auth = await authorizeFoundationManage(userId, foundationId)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		const result = await deleteTeamMemberRecord({
			entityId: foundationId,
			entityColumn: 'foundation_id',
			teamTable: 'foundation_team',
			membersTable: 'foundation_members',
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
