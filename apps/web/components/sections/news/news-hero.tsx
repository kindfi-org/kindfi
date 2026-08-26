'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Rss, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { formatDate } from '~/lib/utils/date-utils'

interface NewsHeroProps {
	articleCount: number
	categoryCount: number
	latestDate?: string
}

export function NewsHero({ articleCount, categoryCount, latestDate }: NewsHeroProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()

	const latestLabel = latestDate ? formatDate(latestDate) : '—'

	return (
		<section
			className="relative isolate w-full overflow-hidden bg-[#fafbfc] pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24"
			aria-labelledby="news-page-title"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
				<div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
			</div>

			<SectionContainer maxWidth="6xl" className="relative">
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						initial={reducedMotion ? false : { opacity: 0, y: 16 }}
						animate={reducedMotion ? false : { opacity: 1, y: 0 }}
						transition={
							reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
						}
					>
						<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
							{t('news.pageEyebrow')}
						</p>
						<h1
							id="news-page-title"
							className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
						>
							{t('news.pageTitle')}{' '}
							<span className="gradient-text">{t('news.pageTitleHighlight')}</span>
						</h1>
						<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
							{t('news.pageSubtitle')}
						</p>
						<p className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[13px]">
							<ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
							{t('news.pageTrustLine')}
						</p>
					</motion.div>

					<motion.div
						className="mt-8 flex justify-center"
						initial={reducedMotion ? false : { opacity: 0, y: 10 }}
						animate={reducedMotion ? false : { opacity: 1, y: 0 }}
						transition={
							reducedMotion
								? { duration: 0 }
								: { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }
						}
					>
						<Link
							href="/news/rss"
							className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-emerald-200/80 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							aria-label={t('news.rssAriaLabel')}
						>
							<Rss className="h-4 w-4 text-emerald-600" aria-hidden />
							{t('news.rssFeed')}
						</Link>
					</motion.div>
				</div>

				<section
					className={cn(
						'relative mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-8 border-t border-slate-200/50 pt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-0 md:mt-14',
					)}
					aria-label={t('news.statsAriaLabel')}
				>
					<HeroStat label={t('news.statArticles')} value={String(articleCount)} />
					<HeroStatDivider />
					<HeroStat label={t('news.statCategories')} value={String(categoryCount)} />
					<HeroStatDivider />
					<HeroStat label={t('news.statLatest')} value={latestLabel} />
				</section>
			</SectionContainer>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
		</section>
	)
}

function HeroStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex-1 text-center sm:px-8">
			<p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
				{value}
			</p>
			<p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
				{label}
			</p>
		</div>
	)
}

function HeroStatDivider() {
	return <div className="hidden h-12 w-px shrink-0 bg-slate-200/80 sm:block" aria-hidden="true" />
}
