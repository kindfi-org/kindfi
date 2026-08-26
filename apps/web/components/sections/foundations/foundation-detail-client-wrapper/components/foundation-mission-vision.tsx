'use client'

import { motion } from 'framer-motion'
import { Eye, Target } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
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
	const { t } = useI18n()

	if (!foundation.mission && !foundation.vision) {
		return null
	}

	return (
		<section aria-label={t('foundations.missionVisionAria')} className="grid gap-5 md:grid-cols-2">
			{foundation.mission ? (
				<motion.article
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.08, duration: 0.5 }}
					className="relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-linear-to-br from-emerald-50/90 via-white to-white p-6 md:p-8"
				>
					<div
						className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl"
						aria-hidden="true"
					/>
					<div className="relative">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-xl bg-emerald-600/10 p-2.5">
								<Target className="h-5 w-5 text-emerald-700" aria-hidden="true" />
							</div>
							<h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
								{t('foundations.mission')}
							</h2>
						</div>
						<p className="text-base leading-relaxed text-slate-600 md:text-lg">
							{foundation.mission}
						</p>
					</div>
				</motion.article>
			) : null}

			{foundation.vision ? (
				<motion.article
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.16, duration: 0.5 }}
					className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-50 via-white to-white p-6 md:p-8"
				>
					<div
						className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl"
						aria-hidden="true"
					/>
					<div className="relative">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-xl bg-slate-900/5 p-2.5">
								<Eye className="h-5 w-5 text-slate-700" aria-hidden="true" />
							</div>
							<h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
								{t('foundations.vision')}
							</h2>
						</div>
						<p className="text-base leading-relaxed text-slate-600 md:text-lg">
							{foundation.vision}
						</p>
					</div>
				</motion.article>
			) : null}
		</section>
	)
}
