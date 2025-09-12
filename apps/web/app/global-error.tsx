'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string }
}) {
	useEffect(() => {
		Sentry.captureException(error, {
			tags: {
				component: 'GlobalError',
				error_boundary: 'root',
			},
			extra: {
				digest: error.digest,
			},
		})
	}, [error])

	return (
		<html>
			<body>
				<NextError statusCode={0} />
			</body>
		</html>
	)
}
