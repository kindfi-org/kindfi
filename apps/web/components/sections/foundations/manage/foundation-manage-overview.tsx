'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	Calendar,
	CheckCircle2,
	Heart,
	Megaphone,
	Pencil,
	TrendingUp,
	Users,
} from 'lucide-react'
import Link from 'next/link'
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
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import {
	FOUNDATION_MANAGE_SECTIONS,
	type FoundationManageSectionKey,
} from './constants'
import { ManagePageShell } from './shared'

interface FoundationManageOverviewProps {
	slug: string
}

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}

const OVERVIEW_CARD_ICONS: Record<
	Exclude<FoundationManageSectionKey, 'overview' | 'edit'>,
	React.ComponentType<{ className?: string }>
> = {
	milestones: TrendingUp,
	members: Users,
	settings: Building2,
	campaigns: Megaphone,
}

export function FoundationManageOverview({
	slug,
}: FoundationManageOverviewProps) {
	const {
		data: foundation,
		isLoading,
		error,
	} = useSupabaseQuery(
		'foundation',
		(client) => getFoundationBySlug(client, slug),
		{
			additionalKeyValues: [slug],
		},
	)

	const shouldReduceMotion = useReducedMotion()

	const yearFounded =
		foundation && foundation.foundedYear > 0 ? foundation.foundedYear : null
	const formattedDonations = foundation
		? new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(foundation.totalDonationsReceived)
		: '$0'

	if (isLoading) {
		return (
			<ManagePageShell>
				<div className="space-y-6">
					<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
					<p className="text-muted-foreground" aria-live="polite">
						Loading…
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{['years', 'donations', 'completed', 'active'].map((id) => (
							<div
								key={id}
								className="h-32 bg-muted animate-pulse rounded-lg"
							/>
						))}
					</div>
				</div>
			</ManagePageShell>
		)
	}

	if (error ?? !foundation) {
		return (
			<ManagePageShell>
				<div className="text-center py-12">
					<Building2
						className="h-16 w-16 text-muted-foreground mx-auto mb-4"
						aria-hidden="true"
					/>
					<h2 className="text-2xl font-bold mb-2">Foundation Not Found</h2>
					<p className="text-muted-foreground mb-6">
						The foundation you&apos;re looking for doesn&apos;t exist or has
						been removed.
					</p>
					<Button asChild>
						<Link href="/foundations">Browse All Foundations</Link>
					</Button>
				</div>
			</ManagePageShell>
		)
	}

	const stats = [
		...(yearFounded != null
			? [
					{
						label: 'Year Founded',
						value: yearFounded,
						icon: Calendar,
						color: 'text-blue-600',
						bgColor: 'bg-blue-100',
					},
				]
			: []),
		{
			label: 'Total Donations',
			value: formattedDonations,
			icon: Heart,
			color: 'text-green-600',
			bgColor: 'bg-green-100',
		},
		{
			label: 'Completed Campaigns',
			value: foundation.totalCampaignsCompleted,
			icon: CheckCircle2,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
		},
		{
			label: 'Active Campaigns',
			value: foundation.totalCampaignsOpen,
			icon: Users,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
		},
	]

	const managementSections = FOUNDATION_MANAGE_SECTIONS.filter(
		(s) => s.key !== 'overview' && s.key !== 'edit',
	)

	return (
		<ManagePageShell>
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="space-y-8 lg:space-y-12"
			>
				<motion.p
					variants={cardVariants}
					className="text-muted-foreground text-lg"
				>
					Overview and quick actions for your foundation. Edit details,
					milestones, team, and settings.
				</motion.p>

				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
					className={`grid gap-4 md:grid-cols-2 ${
						yearFounded != null ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
					}`}
				>
					{stats.map((stat, index) => (
						<motion.div key={stat.label} variants={cardVariants} custom={index}>
							<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-xl transition-[box-shadow] duration-300 relative group h-full">
								<div
									className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"
									aria-hidden="true"
								/>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{stat.label}
									</CardTitle>
									<div className={`${stat.bgColor} p-2 rounded-lg`}>
										<stat.icon
											className={`h-4 w-4 ${stat.color}`}
											aria-hidden="true"
										/>
									</div>
								</CardHeader>
								<CardContent className="relative z-10">
									<motion.div
										initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
										animate={{ scale: 1 }}
										transition={{
											delay: shouldReduceMotion ? 0 : 0.1 * index,
											type: 'spring',
										}}
										className="text-2xl font-bold tabular-nums"
									>
										{stat.value}
									</motion.div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>

				<motion.section variants={cardVariants} className="space-y-6">
					<div className="flex items-center gap-4">
						<Badge
							variant="outline"
							className="text-sm font-semibold px-4 py-1.5 border-purple-600 text-purple-600"
						>
							Edit &amp; manage
						</Badge>
						<div className="h-px flex-1 bg-gradient-to-r from-purple-200 via-blue-200 to-transparent" />
					</div>
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						{/* Edit foundation — primary edit action */}
						<motion.div
							variants={cardVariants}
							custom={0}
							whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
							transition={{ type: 'spring', stiffness: 300 }}
						>
							<Card className="border-2 border-purple-200 overflow-hidden shadow-lg hover:shadow-xl transition-[box-shadow,transform] duration-300 h-full flex flex-col bg-card relative group">
								<div
									className="absolute inset-0 bg-purple-500/5 pointer-events-none"
									aria-hidden="true"
								/>
								<CardHeader className="relative z-10">
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
											<Pencil
												className="h-5 w-5 text-purple-600"
												aria-hidden="true"
											/>
										</div>
										<CardTitle className="text-lg font-bold">
											Edit foundation
										</CardTitle>
									</div>
									<CardDescription className="text-sm">
										Update name, description, mission, vision, logo, and links.
									</CardDescription>
								</CardHeader>
								<CardContent className="relative z-10 mt-auto">
									<Button
										asChild
										variant="outline"
										className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
									>
										<Link href={`/foundations/${slug}/manage/edit`}>
											Edit foundation
											<ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</motion.div>
						{managementSections.map((section, index) => {
							const Icon =
								OVERVIEW_CARD_ICONS[
									section.key as keyof typeof OVERVIEW_CARD_ICONS
								]
							return (
								<motion.div
									key={section.key}
									variants={cardVariants}
									custom={index + 1}
									whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
									transition={{ type: 'spring', stiffness: 300 }}
								>
									<Card className="border-0 overflow-hidden shadow-lg hover:shadow-xl transition-[box-shadow,transform] duration-300 h-full flex flex-col bg-card relative group">
										<div
											className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300 pointer-events-none"
											aria-hidden="true"
										/>
										<CardHeader className="relative z-10">
											<div className="flex items-center gap-3 mb-2">
												<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
													<Icon
														className="h-5 w-5 text-purple-600"
														aria-hidden="true"
													/>
												</div>
												<CardTitle className="text-lg font-bold">
													{section.title}
												</CardTitle>
											</div>
											<CardDescription className="text-sm">
												{section.description}
											</CardDescription>
										</CardHeader>
										<CardContent className="relative z-10 mt-auto">
											<Button
												asChild
												variant="outline"
												className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
											>
												<Link href={section.href(slug)}>
													{section.cta}
													<ArrowRight
														className="h-4 w-4 ml-2"
														aria-hidden="true"
													/>
												</Link>
											</Button>
										</CardContent>
									</Card>
								</motion.div>
							)
						})}
					</motion.div>
				</motion.section>
			</motion.div>
		</ManagePageShell>
	)
}
