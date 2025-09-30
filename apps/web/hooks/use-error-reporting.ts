import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { logger } from '~/lib'

export function useErrorReporting(
	error: Error | null,
	context: Record<string, unknown> = {},
) {
	useEffect(() => {
		if (error) {
			// Log to console and Sentry via our logger
			logger.error({
				eventType: 'Component Error',
				error: error.message,
				stack: error.stack,
				...context,
			})

			// Also capture directly with additional context
			if (process.env.NODE_ENV === 'production') {
				Sentry.captureException(error, {
					extra: context,
					tags: {
						source: 'useErrorReporting',
					},
				})
			}
		}
	}, [error, context])
}
