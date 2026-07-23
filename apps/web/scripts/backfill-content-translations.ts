/**
 * One-off backfill for AI content translations.
 *
 * Usage (from apps/web):
 *   bun scripts/backfill-content-translations.ts
 *
 * Or from repo root (must run via apps/web so Bun loads .env):
 *   cd apps/web && bun scripts/backfill-content-translations.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, and AI_GATEWAY_API_KEY in env.
 */

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '../lib/logger'
import { enqueueTranslation } from '../lib/services/content-translation/enqueue-translation'
import { runTranslationJob } from '../lib/services/content-translation/run-translation-job'

const BATCH_DELAY_MS = 1500

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function backfillFoundations(): Promise<number> {
	const { data, error } = await supabaseServiceRole.from('foundations').select('id')

	if (error) throw error

	let count = 0
	for (const row of data ?? []) {
		const job = await enqueueTranslation('foundation', row.id)
		if (!job) continue

		await runTranslationJob('foundation', row.id, job.targetLocale)
		count += 1
		await sleep(BATCH_DELAY_MS)
	}

	return count
}

async function backfillProjects(): Promise<number> {
	const { data, error } = await supabaseServiceRole.from('projects').select('id')

	if (error) throw error

	let count = 0
	for (const row of data ?? []) {
		const job = await enqueueTranslation('project', row.id)
		if (!job) continue

		await runTranslationJob('project', row.id, job.targetLocale)
		count += 1
		await sleep(BATCH_DELAY_MS)
	}

	return count
}

async function backfillProjectPitches(): Promise<number> {
	const { data, error } = await supabaseServiceRole.from('project_pitch').select('id')

	if (error) throw error

	let count = 0
	for (const row of data ?? []) {
		const job = await enqueueTranslation('project_pitch', row.id)
		if (!job) continue

		await runTranslationJob('project_pitch', row.id, job.targetLocale)
		count += 1
		await sleep(BATCH_DELAY_MS)
	}

	return count
}

async function main(): Promise<void> {
	logger.info('Starting content translation backfill...')

	const [foundations, projects, pitches] = await Promise.all([
		backfillFoundations(),
		backfillProjects(),
		backfillProjectPitches(),
	])

	logger.info('Backfill complete', {
		foundations,
		projects,
		pitches,
	})
}

main().catch((error) => {
	logger.error('Backfill failed', error)
	process.exit(1)
})
