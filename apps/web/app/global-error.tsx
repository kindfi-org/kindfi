'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { Button } from '~/components/base/button'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		logger.error('Global error boundary caught an error', error)
	}, [error])

	return (
		<html lang="en">
			<body className="flex min-h-screen items-center justify-center bg-background p-6">
				<div className="max-w-md space-y-4 text-center">
					<h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
					<p className="text-sm text-muted-foreground">
						KindFi hit an unexpected error while loading this page. You can try again, or continue
						without wallet features if storage is blocked in your browser.
					</p>
					<div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
						<Button type="button" onClick={() => reset()}>
							Try again
						</Button>
						<Button type="button" variant="outline" onClick={() => window.location.assign('/')}>
							Go to homepage
						</Button>
					</div>
				</div>
			</body>
		</html>
	)
}
