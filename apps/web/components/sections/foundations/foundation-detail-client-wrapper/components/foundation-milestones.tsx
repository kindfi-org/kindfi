'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationMilestonesProps {
	milestones: NonNullable<Foundation['milestones']>
	shouldReduceMotion: boolean | null
}

export function FoundationMilestones({
	milestones,
	shouldReduceMotion,
}: FoundationMilestonesProps) {
	if (!milestones.length) {
		return null
	}

	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Key milestones</h2>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{milestones.map((milestone, index) => (
					<motion.div
						key={milestone.id}
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.1 * index }}
					>
						<Card className="h-full border-l-4 border-l-primary transition-shadow hover:shadow-md">
							<CardContent className="p-6">
								<div className="mb-3 flex items-start justify-between gap-4">
									<h3 className="flex-1 text-lg font-semibold">{milestone.title}</h3>
									<Badge variant="outline" className="shrink-0">
										{new Intl.DateTimeFormat('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										}).format(new Date(milestone.achievedDate))}
									</Badge>
								</div>
								{milestone.description && (
									<p className="mb-3 text-sm text-muted-foreground">{milestone.description}</p>
								)}
								{milestone.impactMetric && (
									<div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
										<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
										<span>{milestone.impactMetric}</span>
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	)
}
