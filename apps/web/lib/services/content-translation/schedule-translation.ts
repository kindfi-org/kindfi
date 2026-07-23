import 'server-only'

import { after } from 'next/server'
import { logger } from '@/lib/logger'
import { enqueueTranslation } from './enqueue-translation'
import { runTranslationJob } from './run-translation-job'
import type { ContentEntityType } from './types'

export function scheduleContentTranslation(entityType: ContentEntityType, entityId: string): void {
	after(async () => {
		try {
			const job = await enqueueTranslation(entityType, entityId)
			if (!job) return

			await runTranslationJob(entityType, entityId, job.targetLocale)
		} catch (error) {
			logger.error('scheduleContentTranslation failed', { entityType, entityId, error })
		}
	})
}

export function scheduleContentTranslations(
	jobs: Array<{ entityType: ContentEntityType; entityId: string }>,
): void {
	for (const job of jobs) {
		scheduleContentTranslation(job.entityType, job.entityId)
	}
}
