'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationStoryImpactProps {
	foundation: Foundation
	shouldReduceMotion: boolean | null
}

export function FoundationStoryImpact({
	foundation,
	shouldReduceMotion,
}: FoundationStoryImpactProps) {
	const { t } = useI18n()
	const hasStory = Boolean(foundation.story?.trim())
	const impactHighlights =
		foundation.impactHighlights?.filter((item) => item.trim().length > 0) ?? []

	if (!hasStory && impactHighlights.length === 0) {
		return null
	}

	return (
		<section className="space-y-8" aria-label={t('foundations.storyImpactAria')}>
			{hasStory ? (
				<motion.article
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.05, duration: 0.5 }}
					className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-6 py-8 sm:px-8 md:px-10 md:py-10"
				>
					<div
						className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-500 via-emerald-600 to-emerald-800"
						aria-hidden="true"
					/>
					<p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('foundations.storyLabel')}
					</p>
					<h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
						{t('foundations.ourStory')}
					</h2>
					<p className="w-full whitespace-pre-line text-pretty text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl md:leading-relaxed">
						{foundation.story}
					</p>
				</motion.article>
			) : null}

			{impactHighlights.length > 0 ? (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.1, duration: 0.5 }}
				>
					<div className="mb-5">
						<p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
							{t('foundations.impactLabel')}
						</p>
						<h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
							{t('foundations.ourImpact')}
						</h2>
					</div>
					<ul className="grid gap-3 sm:grid-cols-2">
						{impactHighlights.map((highlight, index) => (
							<li
								key={highlight}
								className="group flex items-start gap-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/40 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/80"
							>
								<span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
									{index + 1}
								</span>
								<span className="pt-0.5 text-sm leading-relaxed text-slate-700 md:text-base">
									{highlight}
								</span>
								<CheckCircle2
									className="mt-0.5 ml-auto h-5 w-5 shrink-0 text-emerald-600 opacity-60 transition-opacity group-hover:opacity-100"
									aria-hidden="true"
								/>
							</li>
						))}
					</ul>
				</motion.div>
			) : null}
		</section>
	)
}
