'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'
import { cn } from '~/lib/utils'

interface ProjectsHeroProps {
	categorySlugs?: string[]
	sortSlug?: string
}

export function ProjectsHero({ categorySlugs = [], sortSlug = 'most-popular' }: ProjectsHeroProps) {
	const { t, language } = useI18n()
	const reducedMotion = useReducedMotion()

	const { data: projects = [], isLoading: isLoadingProjects } = useSupabaseQuery(
		'projects',
		(client) =>
			getAllProjects(client, categorySlugs, sortSlug, undefined, { viewerLocale: language }),
		{
			additionalKeyValues: [categorySlugs, sortSlug, language],
		},
	)

	const { data: categories = [], isLoading: isLoadingCategories } = useSupabaseQuery(
		'categories',
		getAllCategories,
		{
			staleTime: 1000 * 60 * 60,
			gcTime: 1000 * 60 * 60,
		},
	)

	const acceptingDonationsCount = useMemo(
		() => projects.filter((project) => Boolean(project.escrowContractAddress)).length,
		[projects],
	)

	const isLoadingStats = isLoadingProjects || isLoadingCategories

	return (
		<section
			className="relative isolate w-full overflow-hidden bg-[#fafbfc] pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24"
			aria-labelledby="projects-page-title"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
				<div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
			</div>

			<SectionContainer className="relative" withPadding>
				<motion.div
					className="mx-auto max-w-4xl text-center"
					initial={reducedMotion ? false : { opacity: 0, y: 16 }}
					animate={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
					}
				>
					<p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('projects.pageEyebrow')}
					</p>
					<h1
						id="projects-page-title"
						className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
					>
						{t('projects.pageTitle')}{' '}
						<span className="gradient-text">{t('projects.pageTitleHighlight')}</span>
					</h1>
					<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('projects.pageSubtitle')}
					</p>
					<p className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[13px]">
						<ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
						{t('projects.pageTrustLine')}
					</p>
				</motion.div>

				<section
					className={cn(
						'relative mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-8 border-t border-slate-200/50 pt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-0 md:mt-14',
						isLoadingStats && 'animate-pulse',
					)}
					aria-label={t('projects.statsAriaLabel')}
				>
					<HeroStat
						label={t('projects.statTotalCauses')}
						value={isLoadingStats ? null : projects.length}
					/>
					<HeroStatDivider />
					<HeroStat
						label={t('projects.statAcceptingDonations')}
						value={isLoadingStats ? null : acceptingDonationsCount}
					/>
					<HeroStatDivider />
					<HeroStat
						label={t('projects.statCategories')}
						value={isLoadingStats ? null : categories.length}
					/>
				</section>
			</SectionContainer>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
		</section>
	)
}

function HeroStat({ label, value }: { label: string; value: number | null }) {
	return (
		<div className="flex-1 text-center sm:px-8">
			<p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
				{value ?? '—'}
			</p>
			<p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
				{label}
			</p>
		</div>
	)
}

function HeroStatDivider() {
	return <div className="hidden h-12 w-px shrink-0 bg-slate-200/70 sm:block" aria-hidden="true" />
}
