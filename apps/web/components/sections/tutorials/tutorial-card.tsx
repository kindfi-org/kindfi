'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import { Card, CardContent, CardHeader } from '~/components/base/card'
import { getFadeInViewProps } from '~/lib/constants/animations'
import type { TutorialCardId } from '~/lib/constants/tutorials-data'
import { useI18n } from '~/lib/i18n'

interface TutorialCardProps {
	id: TutorialCardId
	icon: LucideIcon
	title: string
	description: string
	steps: string[]
	href?: string
	index: number
}

export const TutorialCard = memo(function TutorialCard({
	id,
	icon: Icon,
	title,
	description,
	steps,
	href,
	index,
}: TutorialCardProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const motionProps = getFadeInViewProps(reducedMotion, { delay: index * 0.07 })

	return (
		<motion.article id={`tutorial-${id}`} {...motionProps} className="h-full scroll-mt-36">
			<Card className="flex h-full flex-col border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="mb-3 flex items-start justify-between gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
							<Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
						</div>
						<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
							{steps.length} {t('tutorials.stepsLabel')}
						</span>
					</div>
					<h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
						{title}
					</h3>
					<p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
				</CardHeader>

				<CardContent className="mt-auto space-y-4">
					<details className="group rounded-lg border border-slate-200/80 bg-slate-50/50 open:bg-white">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-emerald-800 marker:content-none [&::-webkit-details-marker]:hidden">
							<span>{t('tutorials.viewSteps')}</span>
							<span
								className="text-xs text-muted-foreground transition-transform group-open:rotate-180"
								aria-hidden="true"
							>
								▼
							</span>
						</summary>
						<ol className="space-y-2.5 border-t border-slate-200/80 px-4 py-4" aria-label={title}>
							{steps.map((step, stepIndex) => (
								<li key={`${id}-step-${stepIndex}`} className="flex gap-3">
									<span
										className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-800"
										aria-hidden="true"
									>
										{stepIndex + 1}
									</span>
									<span className="text-sm leading-relaxed text-slate-700">{step}</span>
								</li>
							))}
						</ol>
					</details>

					{href ? (
						<Link
							href={href}
							className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900"
						>
							{t('tutorials.getStarted')}
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					) : null}
				</CardContent>
			</Card>
		</motion.article>
	)
})
