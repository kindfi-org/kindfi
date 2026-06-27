'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import {
	IoChevronForwardOutline,
	IoCreateOutline,
	IoLockClosedOutline,
	IoMegaphoneOutline,
	IoNewspaperOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { staggerContainer } from '~/lib/constants/animations'
import {
	createManageCardVariants,
	createManageContainerVariants,
	createManageSectionVariants,
} from '~/lib/constants/animations/manage-page.animations'
import { manageCategoryConfig } from '~/lib/constants/projects'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import {
	PROJECT_MANAGE_NAV_SECTIONS,
	type ProjectManageNavSection,
	type ProjectManageSectionKey,
} from './constants'

const SECTION_CARD_ICONS: Record<
	Exclude<ProjectManageSectionKey, 'overview'>,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	basics: IoCreateOutline,
	pitch: IoMegaphoneOutline,
	highlights: IoStarOutline,
	updates: IoNewspaperOutline,
	members: IoPeopleOutline,
	'escrow-setup': IoSettingsOutline,
	'escrow-manage': IoLockClosedOutline,
}

const OVERVIEW_SECTION_KEYS: Record<
	ProjectManageSectionKey,
	'content' | 'team' | 'escrow' | 'overview'
> = {
	overview: 'overview',
	basics: 'content',
	pitch: 'content',
	highlights: 'content',
	updates: 'content',
	members: 'team',
	'escrow-setup': 'escrow',
	'escrow-manage': 'escrow',
}

const OVERVIEW_CATEGORY_LABELS = {
	content: manageCategoryConfig.content,
	team: manageCategoryConfig.team,
	escrow: manageCategoryConfig.escrow,
} as const

type ProjectManageOverviewProps = {
	slug: string
}

export function ProjectManageOverview({ slug }: ProjectManageOverviewProps) {
	const prefersReducedMotion = useReducedMotion()
	const { data: project, isLoading } = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		{ additionalKeyValues: [slug] },
	)

	const {
		displayRaised,
		displaySupporters,
		progressPercent,
		raisedLabel,
		hasEscrow,
		isLoadingStats,
		formatCurrency,
	} = useProjectFundingDisplay({
		projectId: project?.id,
		escrowContractAddress: project?.escrowContractAddress,
		escrowType: project?.escrowType,
		goal: project?.goal,
		dbRaised: project?.raised,
		dbInvestors: project?.investors,
	})

	const containerVariants = useMemo(
		() => createManageContainerVariants(prefersReducedMotion ?? false),
		[prefersReducedMotion],
	)
	const sectionVariants = useMemo(
		() => createManageSectionVariants(prefersReducedMotion ?? false),
		[prefersReducedMotion],
	)
	const cardVariants = useMemo(
		() => createManageCardVariants(prefersReducedMotion ?? false),
		[prefersReducedMotion],
	)

	const sectionsByCategory = useMemo(() => {
		const content: ProjectManageNavSection[] = []
		const team: ProjectManageNavSection[] = []
		const escrow: ProjectManageNavSection[] = []

		for (const section of PROJECT_MANAGE_NAV_SECTIONS) {
			if (section.key === 'overview') continue
			const category = OVERVIEW_SECTION_KEYS[section.key]
			if (category === 'content') content.push(section)
			if (category === 'team') team.push(section)
			if (category === 'escrow') escrow.push(section)
		}

		return { content, team, escrow }
	}, [])

	const formattedRaised = displayRaised === null ? '…' : formatCurrency(displayRaised)
	const formattedGoal = project
		? formatCurrency(project.goal ?? 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
		: '—'
	const formattedSupporters =
		isLoadingStats && displaySupporters === 0 ? '…' : String(displaySupporters)
	const formattedProgress = progressPercent === null ? '…' : `${progressPercent}%`

	if (isLoading) {
		return (
			<div className="space-y-6 pt-2" aria-live="polite">
				<div className="h-28 animate-pulse rounded-xl bg-muted" />
				<div className="grid gap-4 sm:grid-cols-3">
					<div className="h-32 animate-pulse rounded-xl bg-muted" />
					<div className="h-32 animate-pulse rounded-xl bg-muted" />
					<div className="h-32 animate-pulse rounded-xl bg-muted" />
				</div>
			</div>
		)
	}

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="show"
			className="space-y-10 pt-2 lg:space-y-12"
		>
			<motion.section variants={sectionVariants} className="space-y-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
					<p className="mt-1 max-w-2xl text-muted-foreground">
						Everything you need to run{' '}
						<span className="font-medium text-foreground">{project?.title ?? 'this project'}</span>—
						content, team, and escrow in one place.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label={raisedLabel}
						value={formattedRaised}
						hint={hasEscrow ? 'Live from Trustless Work escrow' : undefined}
					/>
					<StatCard label="Goal" value={formattedGoal} />
					<StatCard label="Supporters" value={formattedSupporters} />
					<StatCard label="Progress" value={formattedProgress} />
				</div>
			</motion.section>

			<OverviewCategorySection
				label={OVERVIEW_CATEGORY_LABELS.content.label}
				colorClass={OVERVIEW_CATEGORY_LABELS.content.color}
				gradientClass="from-blue-200 via-indigo-200 to-transparent dark:from-blue-900 dark:via-indigo-900"
				sections={sectionsByCategory.content}
				slug={slug}
				categoryConfig={manageCategoryConfig.content}
				cardVariants={cardVariants}
				sectionVariants={sectionVariants}
			/>

			<OverviewCategorySection
				label={OVERVIEW_CATEGORY_LABELS.team.label}
				colorClass={OVERVIEW_CATEGORY_LABELS.team.color}
				gradientClass="from-purple-200 via-pink-200 to-transparent dark:from-purple-900 dark:via-pink-900"
				sections={sectionsByCategory.team}
				slug={slug}
				categoryConfig={manageCategoryConfig.team}
				cardVariants={cardVariants}
				sectionVariants={sectionVariants}
			/>

			<OverviewCategorySection
				label={OVERVIEW_CATEGORY_LABELS.escrow.label}
				colorClass={OVERVIEW_CATEGORY_LABELS.escrow.color}
				gradientClass="from-green-200 via-emerald-200 to-transparent dark:from-green-900 dark:via-emerald-900"
				sections={sectionsByCategory.escrow}
				slug={slug}
				categoryConfig={manageCategoryConfig.escrow}
				cardVariants={cardVariants}
				sectionVariants={sectionVariants}
			/>
		</motion.div>
	)
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<Card className="border-border/80 bg-card/80">
			<CardHeader className="pb-2">
				<CardDescription className="text-xs font-medium uppercase tracking-wide">
					{label}
				</CardDescription>
				<CardTitle className="text-2xl font-bold tabular-nums">{value}</CardTitle>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</CardHeader>
		</Card>
	)
}

function OverviewCategorySection({
	label,
	colorClass,
	gradientClass,
	sections,
	slug,
	categoryConfig,
	cardVariants,
	sectionVariants,
}: {
	label: string
	colorClass: string
	gradientClass: string
	sections: ProjectManageNavSection[]
	slug: string
	categoryConfig: (typeof manageCategoryConfig)[keyof typeof manageCategoryConfig]
	cardVariants: ReturnType<typeof createManageCardVariants>
	sectionVariants: ReturnType<typeof createManageSectionVariants>
}) {
	return (
		<motion.section variants={sectionVariants} className="space-y-6">
			<div className="flex items-center gap-4">
				<Badge variant="outline" className={`${colorClass} text-sm font-semibold px-4 py-1.5`}>
					{label}
				</Badge>
				<div className={`h-px flex-1 bg-gradient-to-r ${gradientClass}`} />
			</div>
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
			>
				{sections.map((section) => (
					<SectionCard
						key={section.key}
						section={section}
						slug={slug}
						categoryConfig={categoryConfig}
						cardVariants={cardVariants}
					/>
				))}
			</motion.div>
		</motion.section>
	)
}

function SectionCard({
	section,
	slug,
	categoryConfig,
	cardVariants: variants,
}: {
	section: ProjectManageNavSection
	slug: string
	categoryConfig: (typeof manageCategoryConfig)[keyof typeof manageCategoryConfig]
	cardVariants: ReturnType<typeof createManageCardVariants>
}) {
	const Icon = SECTION_CARD_ICONS[section.key as Exclude<ProjectManageSectionKey, 'overview'>]

	return (
		<motion.div variants={variants}>
			<Card className="group relative overflow-hidden transition-[transform,box-shadow] duration-300 hover:shadow-lg hover:-translate-y-1 border border-border bg-card">
				<div
					className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`}
					aria-hidden="true"
				/>
				<CardHeader className="relative z-10 pb-4">
					<div className="flex items-start gap-4">
						<div
							className={`mt-1 rounded-lg bg-gradient-to-br ${categoryConfig.iconGradient} p-3 text-white shadow-sm group-hover:shadow-md transition-shadow duration-300`}
							aria-hidden="true"
						>
							<Icon size={20} aria-hidden="true" />
						</div>
						<div className="min-w-0 flex-1 space-y-2">
							<CardTitle className="text-xl font-semibold text-foreground">
								{section.title}
							</CardTitle>
							<CardDescription className="text-sm leading-relaxed text-muted-foreground">
								{section.description}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="relative z-10 pt-0">
					<Link
						href={section.href(slug)}
						className="inline-block w-full group/button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
					>
						<Button
							variant="outline"
							className="w-full border-border bg-background hover:bg-muted/50 transition-colors duration-200 font-medium"
							endIcon={
								<IoChevronForwardOutline
									className="group-hover/button:translate-x-0.5 transition-transform duration-200"
									aria-hidden="true"
								/>
							}
						>
							{section.cta}
						</Button>
					</Link>
				</CardContent>
			</Card>
		</motion.div>
	)
}
