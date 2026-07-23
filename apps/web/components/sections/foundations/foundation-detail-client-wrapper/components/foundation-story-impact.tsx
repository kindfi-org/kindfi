'use client'

import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
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
		<div className="space-y-6">
			{hasStory ? (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.05 }}
				>
					<Card className="border-slate-200/80 bg-white shadow-sm transition-shadow hover:border-emerald-200/80 hover:shadow-md">
						<CardContent className="p-6 md:p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-lg bg-emerald-50 p-2">
									<BookOpen className="h-5 w-5 text-emerald-700" aria-hidden="true" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight text-slate-900">
									{t('foundations.ourStory')}
								</h2>
							</div>
							<p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
								{foundation.story}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			) : null}

			{impactHighlights.length > 0 ? (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
				>
					<Card className="border-slate-200/80 bg-white shadow-sm transition-shadow hover:border-emerald-200/80 hover:shadow-md">
						<CardContent className="p-6 md:p-8">
							<div className="mb-6 flex items-center gap-3">
								<div className="rounded-lg bg-emerald-50 p-2">
									<CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight text-slate-900">
									{t('foundations.ourImpact')}
								</h2>
							</div>
							<ul className="grid gap-3 sm:grid-cols-2">
								{impactHighlights.map((highlight) => (
									<li
										key={highlight}
										className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3"
									>
										<CheckCircle2
											className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
											aria-hidden="true"
										/>
										<span className="text-sm leading-relaxed text-slate-700 md:text-base">
											{highlight}
										</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</motion.div>
			) : null}
		</div>
	)
}
