'use client'

import dynamic from 'next/dynamic'

const GoogleAnalytics = dynamic(
	() =>
		import('~/components/shared/google-analytics').then((mod) => ({
			default: mod.GoogleAnalytics,
		})),
	{ ssr: false },
)

export function DeferredGoogleAnalytics({ gaMeasurementId }: { gaMeasurementId: string }) {
	if (!gaMeasurementId) return null

	return <GoogleAnalytics GA_MEASUREMENT_ID={gaMeasurementId} />
}
