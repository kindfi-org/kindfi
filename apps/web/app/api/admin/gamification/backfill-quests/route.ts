import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	backfillDonationQuestProgressForUser,
	listContributorIdsWithDonations,
} from '~/lib/services/quest-progress-backfill.service'
import { validateRequest } from '~/lib/utils/validation'

const backfillQuestsSchema = z.object({
	userId: z.string().uuid().optional(),
	all: z.boolean().optional(),
	limit: z.coerce.number().int().min(1).max(500).optional().default(100),
})

async function requireAdminApiUser(userId: string): Promise<boolean> {
	const { supabase } = await import('@packages/lib/supabase')
	const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
	return profile?.role === 'admin'
}

/**
 * POST /api/admin/gamification/backfill-quests
 *
 * Recompute donation quest progress from contributions (DB + on-chain).
 * Use after quest contract sync or to repair users who donated before progress was recorded.
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (!(await requireAdminApiUser(session.user.id))) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const body = await req.json()
		const validation = validateRequest(backfillQuestsSchema, body)
		if (!validation.success) {
			return validation.response
		}

		const { userId, all, limit } = validation.data

		if (!userId && !all) {
			return NextResponse.json(
				{ error: 'Provide userId or set all: true to backfill multiple users' },
				{ status: 400 },
			)
		}

		const { supabase } = await import('@packages/lib/supabase')
		const userIds = userId ? [userId] : await listContributorIdsWithDonations(supabase, limit)

		logger.info('[AdminQuestBackfill] Starting', {
			adminId: session.user.id,
			userCount: userIds.length,
			mode: userId ? 'single' : 'all',
		})

		const results = []
		for (const id of userIds) {
			const result = await backfillDonationQuestProgressForUser(supabase, id)
			results.push(result)
		}

		const summary = {
			usersProcessed: results.length,
			questsUpdated: results.reduce((sum, row) => sum + row.questsUpdated, 0),
			chainSynced: results.reduce((sum, row) => sum + row.chainSynced, 0),
			chainFailed: results.reduce((sum, row) => sum + row.chainFailed, 0),
			errors: results.flatMap((row) => row.errors),
		}

		return NextResponse.json({ success: true, summary, results })
	} catch (error) {
		logger.error('[AdminQuestBackfill] Unexpected error:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		)
	}
}
