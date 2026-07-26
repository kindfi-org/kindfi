'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '~/lib/i18n'

interface LoadMoreSentinelProps {
	/** Called when the sentinel scrolls into the viewport (or user clicks). */
	onLoadMore: () => void
	/** True while a page fetch is in flight. */
	isLoading: boolean
	/** Whether more pages exist. When false, no trigger fires and the button is hidden. */
	hasMore: boolean
}

/**
 * Invisible sentinel element placed at the bottom of the project list.
 *
 * Behaviour:
 * - IntersectionObserver triggers `onLoadMore` automatically when visible.
 * - A visible "Load More" button is always rendered for keyboard / assistive-
 *   technology users and as a fallback when IntersectionObserver is unavailable.
 * - Loading spinner is shown while a page is in flight.
 * - When `hasMore` is false, nothing is rendered.
 */
export function LoadMoreSentinel({ onLoadMore, isLoading, hasMore }: LoadMoreSentinelProps) {
	const { t } = useI18n()
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !hasMore || isLoading) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore()
				}
			},
			{ rootMargin: '200px' }, // pre-load 200 px before edge
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [hasMore, isLoading, onLoadMore])

	if (!hasMore) return null

	return (
		<div
			ref={sentinelRef}
			className="mt-8 flex flex-col items-center gap-3"
			aria-live="polite"
			aria-atomic="true"
		>
			{isLoading ? (
				<output className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					{t('projects.loading')}
				</output>
			) : (
				<button
					type="button"
					onClick={onLoadMore}
					className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-6 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
					aria-label={t('projects.loadMore')}
				>
					{t('projects.loadMore')}
				</button>
			)}
		</div>
	)
}
