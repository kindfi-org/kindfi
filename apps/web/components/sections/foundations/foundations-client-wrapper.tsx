'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Button } from '~/components/base/button'
import { FoundationCard } from '~/components/sections/foundations/foundation-card'
import { staggerContainer } from '~/lib/constants/animations'
import {
	getAllFoundations,
	normalizeFoundationListSort,
} from '~/lib/queries/foundations/get-all-foundations'

export function FoundationsClientWrapper() {
	const searchParams = useSearchParams()
	const sortSlug = normalizeFoundationListSort(searchParams.get('sort'))

	const {
		data: foundations = [],
		isLoading,
		error,
	} = useSupabaseQuery('foundations', (client) => getAllFoundations(client, sortSlug), {
		additionalKeyValues: [sortSlug],
	})

	const loadingSkeletons = useMemo(
		() =>
			['a', 'b', 'c', 'd', 'e', 'f'].map((id) => (
				<div
					key={`skeleton-${id}`}
					className="min-h-[22rem] animate-pulse rounded-2xl border border-border bg-card"
				/>
			)),
		[],
	)

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{loadingSkeletons}</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
				<Building2 className="mx-auto mb-4 h-14 w-14 text-muted-foreground" aria-hidden="true" />
				<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
					We couldn&apos;t load foundations
				</h2>
				<p className="mx-auto mt-2 max-w-md text-muted-foreground">
					Check your connection and try again. If the problem continues, try back later.
				</p>
				<Button className="mt-6" onClick={() => window.location.reload()} type="button">
					Retry
				</Button>
			</div>
		)
	}

	if (foundations.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
				<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<Building2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
				</div>
				<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">No foundations yet</h2>
				<p className="mx-auto mt-2 max-w-md text-muted-foreground">
					When organizations join KindFi, they will appear here. You can register your foundation to
					get started.
				</p>
				<Button asChild className="mt-6">
					<Link href="/create-foundation">Create a foundation</Link>
				</Button>
			</div>
		)
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={sortSlug}
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				exit="exit"
				className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
