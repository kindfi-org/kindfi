'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '~/components/base/card'

interface TutorialCardProps {
	icon: LucideIcon
	title: string
	description: string
	steps: string[]
	index: number
}

export function TutorialCard({ icon: Icon, title, description, steps, index }: TutorialCardProps) {
	const reducedMotion = useReducedMotion()

	return (
		<motion.div
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={
				reducedMotion
					? { duration: 0 }
					: { duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }
			}
			viewport={{ once: true }}
		>
			<Card className="h-full border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
						<Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
					</div>
					<h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
						{title}
					</h3>
					<p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
				</CardHeader>

				<CardContent>
					<ol className="space-y-2.5" aria-label={`Steps for ${title}`}>
						{steps.map((step, i) => (
							<li key={step} className="flex gap-3">
								<span
									className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-800"
									aria-hidden="true"
								>
									{i + 1}
								</span>
								<span className="text-sm leading-relaxed text-slate-700">{step}</span>
							</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</motion.div>
	)
}
