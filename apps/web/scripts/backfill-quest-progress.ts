/**
 * Backfill donation quest progress (Supabase + on-chain) for users who donated
 * before quest contract sync was fixed.
 *
 * Usage:
 *   cd apps/web
 *   bun run scripts/backfill-quest-progress.ts --user-id <UUID>
 *   bun run scripts/backfill-quest-progress.ts --all --limit 100
 */

import { supabase } from '@packages/lib/supabase'
import {
	backfillDonationQuestProgressForUser,
	listContributorIdsWithDonations,
} from '../lib/services/quest-progress-backfill.service'

function parseArgs(argv: string[]) {
	let userId: string | null = null
	let all = false
	let limit = 100

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === '--user-id' && argv[i + 1]) {
			userId = argv[++i]
		} else if (arg === '--all') {
			all = true
		} else if (arg === '--limit' && argv[i + 1]) {
			limit = Number(argv[++i])
		}
	}

	return { userId, all, limit }
}

async function main() {
	const { userId, all, limit } = parseArgs(process.argv.slice(2))

	if (!userId && !all) {
		console.error('Usage:')
		console.error('  bun run scripts/backfill-quest-progress.ts --user-id <UUID>')
		console.error('  bun run scripts/backfill-quest-progress.ts --all [--limit 100]')
		process.exit(1)
	}

	const userIds = userId ? [userId] : await listContributorIdsWithDonations(supabase, limit)
	console.log(`=== Backfill quest progress for ${userIds.length} user(s) ===\n`)

	let totalUpdated = 0
	let totalChainSynced = 0

	for (const id of userIds) {
		const result = await backfillDonationQuestProgressForUser(supabase, id)
		totalUpdated += result.questsUpdated
		totalChainSynced += result.chainSynced

		console.log(
			`${id.slice(0, 8)}… address=${result.stellarAddress ?? 'none'} updated=${result.questsUpdated} chain=${result.chainSynced} skipped=${result.questsSkipped}`,
		)

		for (const err of result.errors) {
			console.log(`  ⚠️  ${err}`)
		}
	}

	console.log('\n=== Done ===')
	console.log(`  Quest rows updated: ${totalUpdated}`)
	console.log(`  On-chain syncs:     ${totalChainSynced}`)
}

main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
