'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { IoChevronForwardOutline } from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { staggerContainer } from '~/lib/constants/animations'
import {
	createManageCardVariants,
	createManageContainerVariants,
	createManageSectionVariants,
} from '~/lib/constants/animations/manage-page.animations'
import { manageCategoryConfig, manageSections } from '~/lib/constants/projects'
import type { SectionCardProps } from '~/lib/types/project/manage.types'

export default function ProjectManagementDashboardPage() {
	const params = useParams()
	const slug = params?.slug as string
	const prefersReducedMotion = useReducedMotion()

	// Memoize filtered sections to avoid recalculation on re-renders
	const contentSections = useMemo(
		() => manageSections.filter((s) => s.category === 'content'),
		[],
	)
	const teamSections = useMemo(
		() => manageSections.filter((s) => s.category === 'team'),
		[],
	)
	const escrowSections = useMemo(
		() => manageSections.filter((s) => s.category === 'escrow'),
		[],
	)

	// Memoize animation variants based on motion preference
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

	if (!slug) {
		return null
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="show"
				className="relative z-10 space-y-12 lg:space-y-16"
			>
				{/* Enhanced Header */}
				<motion.header
					variants={sectionVariants}
					className="space-y-4 relative"
				>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text py-2">
						Project Management
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
						Manage your project content, team, and escrow settings. Keep
						everything up to date and running smoothly.
					</p>
				</motion.header>

				{/* Content Section */}
				<motion.section variants={sectionVariants} className="space-y-6">
					<div className="flex items-center gap-4">
						<Badge
							variant="outline"
							className={`${manageCategoryConfig.content.color} text-sm font-semibold px-4 py-1.5`}
						>
							{manageCategoryConfig.content.label}
						</Badge>
						<div className="h-px flex-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-transparent dark:from-blue-900 dark:via-indigo-900" />
					</div>
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						{contentSections.map((section) => (
							<SectionCard
								key={section.title}
								{...section}
								slug={slug}
								categoryConfig={manageCategoryConfig.content}
								cardVariants={cardVariants}
							/>
						))}
					</motion.div>
				</motion.section>

				{/* Team Section */}
				<motion.section variants={sectionVariants} className="space-y-6">
					<div className="flex items-center gap-4">
						<Badge
							variant="outline"
							className={`${manageCategoryConfig.team.color} text-sm font-semibold px-4 py-1.5`}
						>
							{manageCategoryConfig.team.label}
						</Badge>
						<div className="h-px flex-1 bg-gradient-to-r from-purple-200 via-pink-200 to-transparent dark:from-purple-900 dark:via-pink-900" />
					</div>
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						{teamSections.map((section) => (
							<SectionCard
								key={section.title}
								{...section}
								slug={slug}
								categoryConfig={manageCategoryConfig.team}
								cardVariants={cardVariants}
							/>
						))}
					</motion.div>
				</motion.section>

				{/* Escrow Section */}
				<motion.section variants={sectionVariants} className="space-y-6">
					<div className="flex items-center gap-4">
						<Badge
							variant="outline"
							className={`${manageCategoryConfig.escrow.color} text-sm font-semibold px-4 py-1.5`}
						>
							{manageCategoryConfig.escrow.label}
						</Badge>
						<div className="h-px flex-1 bg-gradient-to-r from-green-200 via-emerald-200 to-transparent dark:from-green-900 dark:via-emerald-900" />
					</div>
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						{escrowSections.map((section) => (
							<SectionCard
								key={section.title}
								{...section}
								slug={slug}
								categoryConfig={manageCategoryConfig.escrow}
								cardVariants={cardVariants}
							/>
						))}
					</motion.div>
				</motion.section>
			</motion.div>
		</div>
	)
}

function SectionCard({
	title,
	description,
	href,
	cta,
	Icon,
	slug,
	categoryConfig,
	cardVariants: variants,
}: SectionCardProps) {
	return (
		<motion.div variants={variants}>
			<Card className="group relative overflow-hidden transition-[transform,box-shadow] duration-300 hover:shadow-lg hover:-translate-y-1 border border-border bg-card">
				{/* Subtle background accent on hover */}
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
							<Icon size={20} className="relative z-10" aria-hidden="true" />
						</div>
						<div className="min-w-0 flex-1 space-y-2">
							<CardTitle className="text-xl font-semibold text-foreground">
								{title}
							</CardTitle>
							<CardDescription className="text-sm leading-relaxed text-muted-foreground">
								{description}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="relative z-10 pt-0">
					<Link
						href={`/projects/${slug}/manage/${href}`}
						className="inline-block w-full group/button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
					>
						<Button
							variant="outline"
							className="w-full border-border bg-background hover:bg-muted/50 transition-colors duration-200 font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							endIcon={
								<IoChevronForwardOutline
									className="group-hover/button:translate-x-0.5 transition-transform duration-200"
									aria-hidden="true"
								/>
							}
						>
							{cta}
						</Button>
					</Link>
				</CardContent>
			</Card>
		</motion.div>
	)
}
