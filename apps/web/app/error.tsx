'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { Button } from '~/components/base/button'

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this export name
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		logger.error('Route error boundary caught an error', error)
	}, [error])

	return (
		<div className="flex min-h-[50vh] items-center justify-center p-6">
			<div className="max-w-md space-y-4 text-center">
				<h2 className="text-xl font-semibold text-foreground">Unable to load this section</h2>
				<p className="text-sm text-muted-foreground">
					An unexpected error occurred. Please try again.
				</p>
				<Button type="button" onClick={() => reset()}>
					Try again
				</Button>
			</div>
		</div>
	)
}
