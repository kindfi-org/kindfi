'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Clock, Heart } from 'lucide-react'
import { useDonationStream } from '~/hooks/projects/use-donation-stream'

interface DonationStreamProps {
	projectSlug: string
}

const formatDonationTime = (donatedAt: string): string => {
	const date = new Date(donatedAt)
	if (Number.isNaN(date.getTime())) return '—'

	return date.toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit',
	})
}

export function DonationStream({ projectSlug }: DonationStreamProps) {
	const reducedMotion = useReducedMotion()
	const { donations, isLoading, error } = useDonationStream({ projectSlug })

	return (
		<section
			className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5"
			aria-labelledby="donation-stream-heading"
		>
			<div className="mb-4 flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
					<Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" aria-hidden="true" />
				</div>
				<h3 id="donation-stream-heading" className="text-lg font-semibold text-gray-900">
					Latest Donations
				</h3>
			</div>

			{isLoading ? (
				<ul className="space-y-2" aria-label="Loading latest donations">
					{['donation-skeleton-a', 'donation-skeleton-b', 'donation-skeleton-c'].map((key) => (
						<li key={key} className="h-10 animate-pulse rounded-lg bg-emerald-100/60" />
					))}
				</ul>
			) : error ? (
				<p className="text-sm text-muted-foreground">Unable to load latest donations right now.</p>
			) : donations.length === 0 ? (
				<p className="text-sm text-muted-foreground">No donations yet. Be the first to support.</p>
			) : (
				<ul
					className="max-h-56 space-y-2 overflow-y-auto pr-1"
					aria-live="polite"
					aria-label="Latest donations"
				>
					{donations.map((donation, index) => (
						<motion.li
							key={donation.id}
							className="flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2.5 shadow-sm"
							initial={reducedMotion ? false : { opacity: 0, y: 8 }}
							animate={reducedMotion ? false : { opacity: 1, y: 0 }}
							transition={reducedMotion ? { duration: 0 } : { duration: 0.25, delay: index * 0.03 }}
						>
							<div className="flex min-w-0 items-center gap-2">
								<Heart
									className="h-3.5 w-3.5 shrink-0 fill-emerald-500 text-emerald-500"
									aria-hidden="true"
								/>
								<span className="truncate text-sm font-medium text-gray-800">New donation</span>
							</div>
							<span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
								<Clock className="h-3 w-3" aria-hidden="true" />
								<time dateTime={donation.donatedAt}>{formatDonationTime(donation.donatedAt)}</time>
							</span>
						</motion.li>
					))}
				</ul>
			)}
		</section>
	)
}
