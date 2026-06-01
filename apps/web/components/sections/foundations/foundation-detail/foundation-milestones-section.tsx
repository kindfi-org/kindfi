'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import type { useFoundationDetail } from './use-foundation-detail'

type Foundation = NonNullable<
	ReturnType<typeof useFoundationDetail>['foundation']
>

export function FoundationMilestonesSection({
	foundation,
	shouldReduceMotion,
}: {
	foundation: Foundation
	shouldReduceMotion: boolean | null
}) {
	if (!foundation.milestones || foundation.milestones.length === 0) {
		return null
	}

	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
		>
			<div className="flex items-center gap-3 mb-6">
				<TrendingUp className="h-6 w-6 text-purple-600" aria-hidden="true" />
				<h2 className="text-3xl font-bold">Key Milestones</h2>
			</div>
			<div className="grid md:grid-cols-2 gap-4">
				{foundation.milestones.map((milestone, index) => (
					<motion.div
						key={milestone.id}
						initial={
							shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
						}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.1 * index }}
					>
						<Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
							<CardContent className="p-6">
								<div className="flex items-start justify-between gap-4 mb-3">
									<h3 className="text-lg font-semibold flex-1">
										{milestone.title}
									</h3>
									<Badge variant="outline" className="shrink-0">
										{new Intl.DateTimeFormat('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										}).format(new Date(milestone.achievedDate))}
									</Badge>
								</div>
								{milestone.description && (
									<p className="text-sm text-muted-foreground mb-3">
										{milestone.description}
									</p>
								)}
								{milestone.impactMetric && (
									<div className="flex items-center gap-2 text-green-600 font-semibold">
										<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
										<span className="text-sm">{milestone.impactMetric}</span>
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
