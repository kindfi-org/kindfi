'use client'

import { motion } from 'framer-motion'
import { Eye, Target } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import type { useFoundationDetail } from './use-foundation-detail'

type Foundation = NonNullable<
	ReturnType<typeof useFoundationDetail>['foundation']
>

export function FoundationMissionVision({
	foundation,
	shouldReduceMotion,
}: {
	foundation: Foundation
	shouldReduceMotion: boolean | null
}) {
	if (!foundation.mission && !foundation.vision) {
		return null
	}

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{foundation.mission && (
				<motion.div
					initial={
						shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
					}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
				>
					<Card className="h-full border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white hover:shadow-lg transition-shadow">
						<CardContent className="p-6 md:p-8">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 rounded-lg bg-purple-100">
									<Target
										className="h-5 w-5 text-purple-600"
										aria-hidden="true"
									/>
								</div>
								<h2 className="text-2xl font-bold">Mission</h2>
							</div>
							<p className="text-muted-foreground leading-relaxed">
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
					<Card className="h-full border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white hover:shadow-lg transition-shadow">
						<CardContent className="p-6 md:p-8">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 rounded-lg bg-blue-100">
									<Eye className="h-5 w-5 text-blue-600" aria-hidden="true" />
								</div>
								<h2 className="text-2xl font-bold">Vision</h2>
							</div>
							<p className="text-muted-foreground leading-relaxed">
								{foundation.vision}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	)
}
