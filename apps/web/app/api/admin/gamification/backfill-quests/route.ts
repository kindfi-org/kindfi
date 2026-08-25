import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { requireAdminApi } from '~/lib/auth/require-admin-api'
import { recordAdminAudit } from '~/lib/services/admin-audit'
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

/**
 * POST /api/admin/gamification/backfill-quests
 *
 * Recompute donation quest progress from contributions (DB + on-chain).
 * Use after quest contract sync or to repair users who donated before progress was recorded.
 */
export async function POST(req: NextRequest) {
	try {
		const auth = await requireAdminApi()
		if (!auth.ok) return auth.response

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
			adminId: auth.userId,
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

		void recordAdminAudit({
			operation: 'admin_quest_backfill_run',
			resourceType: 'quest',
			resourceId: userId ?? 'all',
			actorId: auth.userId,
			status: summary.chainFailed > 0 ? 'failure' : 'success',
			failureReason: summary.chainFailed > 0 ? `${summary.chainFailed} chain syncs failed` : null,
			details: {
				mode: userId ? 'single' : 'all',
				users_processed: summary.usersProcessed,
				quests_updated: summary.questsUpdated,
				chain_synced: summary.chainSynced,
				chain_failed: summary.chainFailed,
			},
		})

		return NextResponse.json({ success: true, summary, results })
	} catch (error) {
		logger.error('[AdminQuestBackfill] Unexpected error:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		)
	}
}
