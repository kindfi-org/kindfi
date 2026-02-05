'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Button } from '~/components/base/button'
import { FoundationCard } from '~/components/sections/foundations/foundation-card'
import { staggerContainer } from '~/lib/constants/animations'
import { getAllFoundations } from '~/lib/queries/foundations/get-all-foundations'

export function FoundationsClientWrapper() {
	const searchParams = useSearchParams()
	const sortParam = searchParams.get('sort') ?? 'most-recent'

	const {
		data: foundations = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'foundations',
		(client) => getAllFoundations(client, sortParam),
		{
			additionalKeyValues: [sortParam],
		},
	)

	const loadingSkeletons = useMemo(
		() =>
			['a', 'b', 'c', 'd', 'e', 'f'].map((id) => (
				<div
					key={`skeleton-${id}`}
					className="h-full bg-muted animate-pulse rounded-xl"
					style={{ minHeight: '400px' }}
				/>
			)),
		[],
	)

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{loadingSkeletons}
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center py-16">
				<Building2
					className="h-16 w-16 text-muted-foreground mx-auto mb-4"
					aria-hidden="true"
				/>
				<h2 className="text-2xl font-bold mb-2">Error Loading Foundations</h2>
				<p className="text-muted-foreground mb-6">
					We couldn&apos;t load the foundations. Please try again later.
				</p>
				<Button onClick={() => window.location.reload()}>Retry</Button>
			</div>
		)
	}

	if (foundations.length === 0) {
		return (
			<div className="text-center py-16">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
					<Building2 className="h-10 w-10 text-purple-600" aria-hidden="true" />
				</div>
				<h2 className="text-2xl font-bold mb-2">No Foundations Yet</h2>
				<p className="text-muted-foreground max-w-md mx-auto">
					Explore back later to discover foundations making an impact in their
					communities.
				</p>
			</div>
		)
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={sortParam}
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				exit="exit"
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				{foundations.map((foundation, index) => (
					<motion.div
						key={foundation.id}
						variants={{
							initial: { opacity: 0, y: 20 },
							animate: { opacity: 1, y: 0 },
						}}
						custom={index}
					>
						<FoundationCard foundation={foundation} />
					</motion.div>
				))}
			</motion.div>
		</AnimatePresence>
	)
}
