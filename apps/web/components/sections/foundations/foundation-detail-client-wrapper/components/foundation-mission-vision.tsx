'use client'

import { motion } from 'framer-motion'
import { Eye, Target } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationMissionVisionProps {
	foundation: Foundation
	shouldReduceMotion: boolean | null
}

export function FoundationMissionVision({
	foundation,
	shouldReduceMotion,
}: FoundationMissionVisionProps) {
	if (!foundation.mission && !foundation.vision) {
		return null
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{foundation.mission && (
				<motion.div
					initial={
						shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
					}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
				>
					<Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
						<CardContent className="p-6 md:p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Target
										className="h-5 w-5 text-primary"
										aria-hidden="true"
									/>
								</div>
								<h2 className="text-2xl font-bold tracking-tight">Mission</h2>
							</div>
							<p className="leading-relaxed text-muted-foreground">
								{foundation.mission}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			)}
			{foundation.vision && (
				<motion.div
					initial={
						shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
					}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
				>
					<Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
						<CardContent className="p-6 md:p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2">
									<Eye className="h-5 w-5 text-primary" aria-hidden="true" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight">Vision</h2>
							</div>
							<p className="leading-relaxed text-muted-foreground">
								{foundation.vision}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	)
}
