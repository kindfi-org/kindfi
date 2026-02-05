'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Plus, TrendingUp } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { IoCalendarOutline } from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { AddMilestoneDialog } from './add-milestone-dialog'
import { FOUNDATION_MANAGE_SECTIONS } from './constants'
import { ManagePageShell, ManageSectionHeader } from './shared'

interface FoundationMilestonesWrapperProps {
	foundationSlug: string
}

const milestonesSection = FOUNDATION_MANAGE_SECTIONS.find(
	(s) => s.key === 'milestones',
)

export function FoundationMilestonesWrapper({
	foundationSlug,
}: FoundationMilestonesWrapperProps) {
	const prefersReducedMotion = useReducedMotion()
	const [addDialogOpen, setAddDialogOpen] = useState(false)
	const {
		data: foundation,
		error,
		isLoading,
	} = useSupabaseQuery(
		'foundation',
		(client) => getFoundationBySlug(client, foundationSlug),
		{ additionalKeyValues: [foundationSlug] },
	)

	if (error ?? !foundation) {
		notFound()
	}

	if (isLoading) {
		return (
			<ManagePageShell>
				<div className="space-y-6">
					<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
					<p className="text-muted-foreground" aria-live="polite">
						Loading…
					</p>
					<div className="h-48 bg-muted animate-pulse rounded-lg" />
				</div>
			</ManagePageShell>
		)
	}

	const milestones = foundation.milestones ?? []
	const hasMilestones = milestones.length > 0

	return (
		<ManagePageShell>
			<AddMilestoneDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				foundationSlug={foundationSlug}
			/>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<ManageSectionHeader
					icon={
						<IoCalendarOutline
							size={24}
							className="relative z-10"
							aria-hidden="true"
						/>
					}
					title="Foundation Milestones"
					description={
						milestonesSection?.description ??
						"Track and showcase your foundation's key achievements"
					}
				/>
				<Button
					onClick={() => setAddDialogOpen(true)}
					className="shrink-0 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
				>
					<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
					Add milestone
				</Button>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{
					delay: prefersReducedMotion ? 0 : 0.2,
					duration: prefersReducedMotion ? 0 : 0.3,
					transitionProperty: 'opacity',
				}}
				className="space-y-6"
			>
				{hasMilestones ? (
					<div className="grid gap-4 md:grid-cols-2">
						{milestones.map((milestone, index) => (
							<motion.div
								key={milestone.id}
								initial={
									prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
								}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: prefersReducedMotion ? 0 : 0.1 * index,
								}}
							>
								<Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-[box-shadow] h-full">
									<CardHeader>
										<div className="flex items-start justify-between gap-4">
											<CardTitle className="text-lg font-semibold flex-1">
												{milestone.title}
											</CardTitle>
											<Badge variant="outline" className="shrink-0">
												{new Intl.DateTimeFormat('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												}).format(new Date(milestone.achievedDate))}
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										{milestone.description ? (
											<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
												{milestone.description}
											</p>
										) : null}
										{milestone.impactMetric ? (
											<div className="flex items-center gap-2 text-green-600 font-semibold">
												<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
												<span className="text-sm">
													{milestone.impactMetric}
												</span>
											</div>
										) : null}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				) : (
					<Card className="border-0 bg-muted/50">
						<CardContent className="py-16 text-center">
							<TrendingUp
								className="h-16 w-16 text-muted-foreground mx-auto mb-4"
								aria-hidden="true"
							/>
							<h3 className="text-xl font-semibold mb-2">No Milestones Yet</h3>
							<p className="text-muted-foreground mb-6">
								Start tracking your foundation&apos;s achievements by adding
								your first milestone.
							</p>
							<Button
								onClick={() => setAddDialogOpen(true)}
								className="focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
							>
								<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
								Add milestone
							</Button>
						</CardContent>
					</Card>
				)}
			</motion.div>
		</ManagePageShell>
	)
}
