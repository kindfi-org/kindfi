'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import {
	IoChevronForwardOutline,
	IoDocumentTextOutline,
	IoFlagOutline,
	IoLockClosedOutline,
	IoNewspaperOutline,
	IoPeopleOutline,
	IoSettingsOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useProjectFundingDisplay } from '~/hooks/projects/use-project-funding-display'
import { staggerContainer } from '~/lib/constants/animations'
import {
	createManageCardVariants,
	createManageContainerVariants,
	createManageSectionVariants,
} from '~/lib/constants/animations/manage-page.animations'
import { manageCategoryConfig } from '~/lib/constants/projects'
import { useI18n } from '~/lib/i18n/context'
import type { ProjectStatus } from '~/lib/projects/project-status'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import {
	getProjectManageNavSections,
	type ProjectManageNavSection,
	type ProjectManageSectionKey,
} from './constants'
import { ManageSectionHeader } from './manage-section-header'
import { ProjectStatusPanel } from './project-status-panel'
import { TranslationProgressCard } from './translation-progress-card'

const SECTION_CARD_ICONS: Record<
	Exclude<ProjectManageSectionKey, 'overview'>,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	content: IoDocumentTextOutline,
	updates: IoNewspaperOutline,
	members: IoPeopleOutline,
	milestones: IoFlagOutline,
	'escrow-setup': IoSettingsOutline,
	'escrow-manage': IoLockClosedOutline,
}

const OVERVIEW_SECTION_KEYS: Record<
	ProjectManageSectionKey,
	'content' | 'team' | 'escrow' | 'overview'
> = {
	overview: 'overview',
	content: 'content',
	updates: 'content',
	members: 'team',
	milestones: 'escrow',
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
	isPlatformAdmin: boolean
}

export function ProjectManageOverview({ slug, isPlatformAdmin }: ProjectManageOverviewProps) {
	const { t } = useI18n()
	const prefersReducedMotion = useReducedMotion()
	const { data: project, isLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>
	>('basic-project-info', slug, 'basic-info', { additionalKeyValues: [slug] })

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
		raised: project?.raised,
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

	const navSections = useMemo(
		() => getProjectManageNavSections(isPlatformAdmin, hasEscrow),
		[isPlatformAdmin, hasEscrow],
	)

	const sectionsByCategory = useMemo(() => {
		const content: ProjectManageNavSection[] = []
		const team: ProjectManageNavSection[] = []
		const escrow: ProjectManageNavSection[] = []

		for (const section of navSections) {
			if (section.key === 'overview') continue
			const category = OVERVIEW_SECTION_KEYS[section.key]
			if (category === 'content') content.push(section)
			if (category === 'team') team.push(section)
			if (category === 'escrow') escrow.push(section)
		}

		return { content, team, escrow }
	}, [navSections])

	const formattedRaised = displayRaised === null ? '…' : formatCurrency(displayRaised)
	const formattedGoal = project
		? formatCurrency(project.goal ?? 0, { maximumFractionDigits: 0, minimumFractionDigits: 0 })
		: '—'
	const formattedSupporters =
		isLoadingStats && displaySupporters === 0 ? '…' : String(displaySupporters)
	const formattedProgress = progressPercent === null ? '…' : `${progressPercent}%`
	const projectStatus = (project?.status ?? 'draft') as ProjectStatus

	const dashboardDescription = isPlatformAdmin
		? t('projects.manage.dashboardDescriptionAdmin').replace(
				'{title}',
				project?.title ?? t('projects.manage.thisProject'),
			)
		: t('projects.manage.dashboardDescription').replace(
				'{title}',
				project?.title ?? t('projects.manage.thisProject'),
			)

	if (isLoading) {
		return (
			<div className="space-y-6" aria-live="polite">
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
			className="space-y-10 lg:space-y-12"
		>
			<motion.section variants={sectionVariants} className="space-y-4">
				<ManageSectionHeader
					title={t('projects.manage.dashboardTitle')}
					description={dashboardDescription}
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label={raisedLabel}
						value={formattedRaised}
						hint={
							isPlatformAdmin && hasEscrow ? t('projects.manage.raisedFromEscrowHint') : undefined
						}
					/>
					<StatCard label={t('projects.goal')} value={formattedGoal} />
					<StatCard label={t('projects.supporters')} value={formattedSupporters} />
					<StatCard label={t('projects.manage.progressLabel')} value={formattedProgress} />
				</div>
			</motion.section>

			<motion.section variants={sectionVariants}>
				<ProjectStatusPanel slug={slug} status={projectStatus} isPlatformAdmin={isPlatformAdmin} />
			</motion.section>

			<motion.section variants={sectionVariants}>
				<TranslationProgressCard slug={slug} />
			</motion.section>

			<OverviewCategorySection
				label={OVERVIEW_CATEGORY_LABELS.content.label}
				colorClass={OVERVIEW_CATEGORY_LABELS.content.color}
				sections={sectionsByCategory.content}
				slug={slug}
				categoryConfig={manageCategoryConfig.content}
				cardVariants={cardVariants}
				sectionVariants={sectionVariants}
			/>

			<OverviewCategorySection
				label={OVERVIEW_CATEGORY_LABELS.team.label}
				colorClass={OVERVIEW_CATEGORY_LABELS.team.color}
				sections={sectionsByCategory.team}
				slug={slug}
				categoryConfig={manageCategoryConfig.team}
				cardVariants={cardVariants}
				sectionVariants={sectionVariants}
			/>

			{isPlatformAdmin && sectionsByCategory.escrow.length > 0 ? (
				<OverviewCategorySection
					label={OVERVIEW_CATEGORY_LABELS.escrow.label}
					colorClass={OVERVIEW_CATEGORY_LABELS.escrow.color}
					sections={sectionsByCategory.escrow}
					slug={slug}
					categoryConfig={manageCategoryConfig.escrow}
					cardVariants={cardVariants}
					sectionVariants={sectionVariants}
				/>
			) : null}
		</motion.div>
	)
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<Card className="border-border/80 bg-card">
			<CardHeader className="pb-2">
				<CardDescription className="text-xs font-medium uppercase tracking-wide">
					{label}
				</CardDescription>
				<CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</CardHeader>
		</Card>
	)
}

function OverviewCategorySection({
	label,
	colorClass,
	sections,
	slug,
	categoryConfig,
	cardVariants,
	sectionVariants,
}: {
	label: string
	colorClass: string
	sections: ProjectManageNavSection[]
	slug: string
	categoryConfig: (typeof manageCategoryConfig)[keyof typeof manageCategoryConfig]
	cardVariants: ReturnType<typeof createManageCardVariants>
	sectionVariants: ReturnType<typeof createManageSectionVariants>
}) {
	if (sections.length === 0) return null

	return (
		<motion.section variants={sectionVariants} className="space-y-4">
			<div className="flex items-center gap-4">
				<Badge variant="outline" className={`${colorClass} text-sm font-medium px-3 py-1`}>
					{label}
				</Badge>
				<div className="h-px flex-1 bg-border" />
			</div>
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
			<Card className="group relative overflow-hidden border border-border bg-card transition-shadow duration-200 hover:shadow-md">
				<CardHeader className="relative z-10 pb-4">
					<div className="flex items-start gap-4">
						<div
							className={`mt-0.5 rounded-lg bg-gradient-to-br ${categoryConfig.iconGradient} p-2.5 text-white`}
							aria-hidden="true"
						>
							<Icon size={18} aria-hidden="true" />
						</div>
						<div className="min-w-0 flex-1 space-y-1.5">
							<CardTitle className="text-lg font-semibold text-foreground">
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
						className="inline-block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
					>
						<Button
							variant="outline"
							className="w-full border-border bg-background hover:bg-muted/50 font-medium"
							endIcon={
								<IoChevronForwardOutline
									className="group-hover:translate-x-0.5 transition-transform duration-200"
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
