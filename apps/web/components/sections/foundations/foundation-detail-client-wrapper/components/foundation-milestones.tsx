'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, TrendingUp } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
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
	const { t } = useI18n()

	if (!milestones.length) {
		return null
	}

	return (
		<motion.section
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.18, duration: 0.5 }}
			aria-labelledby="foundation-milestones-heading"
		>
			<div className="mb-6 sm:mb-8">
				<p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
					{t('foundations.milestonesEyebrow')}
				</p>
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-emerald-600/10 p-2">
						<TrendingUp className="h-5 w-5 text-emerald-700" aria-hidden="true" />
					</div>
					<h2
						id="foundation-milestones-heading"
						className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
					>
						{t('foundations.keyMilestones')}
					</h2>
				</div>
			</div>

			<div className="relative space-y-4 before:absolute before:bottom-4 before:left-[1.15rem] before:top-4 before:w-px before:bg-emerald-100 md:before:left-[1.35rem]">
				{milestones.map((milestone, index) => (
					<motion.article
						key={milestone.id}
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.08 * index, duration: 0.45 }}
						className="relative grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 pl-14 shadow-sm transition-shadow hover:shadow-md sm:p-6 sm:pl-16 md:grid-cols-[1fr_auto]"
					>
						<span className="absolute left-4 top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500 bg-white md:left-5 md:top-7">
							<span className="h-2 w-2 rounded-full bg-emerald-600" />
						</span>

						<div>
							<h3 className="mb-2 text-lg font-semibold text-slate-900">{milestone.title}</h3>
							{milestone.description ? (
								<p className="mb-3 text-sm leading-relaxed text-slate-500">
									{milestone.description}
								</p>
							) : null}
							{milestone.impactMetric ? (
								<div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
									<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
									<span>{milestone.impactMetric}</span>
								</div>
							) : null}
						</div>

						<time
							dateTime={milestone.achievedDate}
							className="shrink-0 text-sm font-medium tabular-nums text-slate-500 md:text-right"
						>
							{new Intl.DateTimeFormat('en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							}).format(new Date(milestone.achievedDate))}
						</time>
					</motion.article>
				))}
			</div>
		</motion.section>
	)
}
