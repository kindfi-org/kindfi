'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { Building2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'
import { ManageSectionHeader } from './shared'

type FoundationCampaignsWrapperProps = {
	foundationSlug: string
	foundationId: string
}

export function FoundationCampaignsWrapper({
	foundationSlug,
	foundationId,
}: FoundationCampaignsWrapperProps) {
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const shouldReduceMotion = useReducedMotion()

	const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

	// Fetch user's campaigns with foundation_id
	const {
		data: campaigns = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-projects',
		(client) => {
			if (!session?.user?.id) return Promise.resolve([])
			return Promise.resolve(
				client
					.from('projects')
					.select(
						'id, title, slug, description, image_url, created_at, current_amount, target_amount, min_investment, percentage_complete, kinder_count, status, foundation_id',
					)
					.eq('kindler_id', session.user.id)
					.order('created_at', { ascending: false }),
			).then(({ data, error }) => {
				if (error) throw error
				return (
					data?.map((project) => ({
						id: project.id,
						title: project.title,
						slug: project.slug,
						description: project.description,
						image: project.image_url,
						goal: project.target_amount,
						raised: project.current_amount,
						investors: project.kinder_count,
						minInvestment: project.min_investment,
						createdAt: project.created_at,
						status: project.status,
						percentageComplete: project.percentage_complete,
						foundationId: project.foundation_id,
					})) ?? []
				)
			})
		},
		{
			enabled: !!session?.user?.id,
			additionalKeyValues: [session?.user?.id],
		},
	)

	const assignedCampaignIds = useMemo(
		() =>
			new Set(
				campaigns
					.filter((c) => c.foundationId === foundationId)
					.map((c) => c.id),
			),
		[campaigns, foundationId],
	)

	// Filter campaigns based on selection
	const filteredCampaigns = useMemo(() => {
		if (filter === 'assigned') {
			return campaigns.filter((c) => assignedCampaignIds.has(c.id))
		}
		if (filter === 'unassigned') {
			return campaigns.filter((c) => !assignedCampaignIds.has(c.id))
		}
		return campaigns
	}, [campaigns, assignedCampaignIds, filter])

	// Mutation to assign/unassign campaigns
	const assignMutation = useMutation({
		mutationFn: async ({
			projectId,
			assign,
		}: {
			projectId: string
			assign: boolean
		}) => {
			const response = await fetch(
				`/api/foundations/${foundationSlug}/campaigns`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ projectId, assign }),
				},
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Failed to update campaign')
			}

			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'foundation', foundationSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'user-projects', session?.user?.id],
			})
			toast.success('Campaign updated successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update campaign')
		},
	})

	const handleToggleAssignment = (
		projectId: string,
		currentlyAssigned: boolean,
	) => {
		assignMutation.mutate({
			projectId,
			assign: !currentlyAssigned,
		})
	}

	if (!session?.user?.id) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					Please sign in to manage campaigns.
				</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<>
				<ManageSectionHeader
					title="Campaigns"
					description="Assign your campaigns to this foundation to organize them under one umbrella."
					icon={
						<Building2 size={24} className="relative z-10" aria-hidden="true" />
					}
				/>
				<div className="space-y-4">
					<div className="h-10 bg-muted animate-pulse rounded-lg w-1/3" />
					<div className="grid gap-4">
						{['a', 'b', 'c'].map((id) => (
							<div
								key={`skeleton-${id}`}
								className="h-32 bg-muted animate-pulse rounded-lg"
							/>
						))}
					</div>
				</div>
			</>
		)
	}

	if (error) {
		return (
			<>
				<ManageSectionHeader
					title="Campaigns"
					description="Assign your campaigns to this foundation to organize them under one umbrella."
					icon={
						<Building2 size={24} className="relative z-10" aria-hidden="true" />
					}
				/>
				<div className="text-center py-12">
					<p className="text-destructive">
						Error loading campaigns. Please try again.
					</p>
				</div>
			</>
		)
	}

	return (
		<>
			<ManageSectionHeader
				title="Campaigns"
				description="Assign your campaigns to this foundation to organize them under one umbrella."
				icon={
					<Building2 size={24} className="relative z-10" aria-hidden="true" />
				}
			/>

			{/* Filter Tabs */}
			<div
				className="flex gap-2 mb-6 border-b"
				role="tablist"
				aria-label="Filter campaigns"
			>
				<button
					type="button"
					role="tab"
					aria-selected={filter === 'all'}
					onClick={() => setFilter('all')}
					className={cn(
						'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-t',
						filter === 'all'
							? 'border-purple-600 text-purple-700'
							: 'border-transparent text-muted-foreground hover:text-foreground',
					)}
				>
					All ({campaigns.length})
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={filter === 'assigned'}
					onClick={() => setFilter('assigned')}
					className={cn(
						'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-t',
						filter === 'assigned'
							? 'border-purple-600 text-purple-700'
							: 'border-transparent text-muted-foreground hover:text-foreground',
					)}
				>
					Assigned ({assignedCampaignIds.size})
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={filter === 'unassigned'}
					onClick={() => setFilter('unassigned')}
					className={cn(
						'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-t',
						filter === 'unassigned'
							? 'border-purple-600 text-purple-700'
							: 'border-transparent text-muted-foreground hover:text-foreground',
					)}
				>
					Unassigned ({campaigns.length - assignedCampaignIds.size})
				</button>
			</div>

			{/* Campaigns List */}
			{filteredCampaigns.length === 0 ? (
				<div className="text-center py-12">
					<Building2
						className="h-16 w-16 text-muted-foreground mx-auto mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-xl font-semibold mb-2">
						{filter === 'assigned'
							? 'No Assigned Campaigns'
							: filter === 'unassigned'
								? 'All Campaigns Assigned'
								: 'No Campaigns Found'}
					</h3>
					<p className="text-muted-foreground">
						{filter === 'all'
							? 'Create your first campaign to get started.'
							: filter === 'assigned'
								? 'Assign campaigns using the buttons below.'
								: 'All your campaigns are already assigned to this foundation.'}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredCampaigns.map((campaign, index) => {
						const isAssigned = assignedCampaignIds.has(campaign.id)
						const isUpdating =
							assignMutation.isPending &&
							assignMutation.variables?.projectId === campaign.id

						return (
							<motion.div
								key={campaign.id}
								initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: shouldReduceMotion ? 0 : 0.3,
									delay: index * 0.05,
									transitionProperty: 'opacity, transform',
								}}
								className="border rounded-lg p-4 bg-card hover:shadow-md transition-[box-shadow]"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-3 mb-2">
											<Link
												href={`/projects/${campaign.slug}`}
												className="font-semibold text-lg hover:text-purple-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded"
											>
												{campaign.title}
											</Link>
											{isAssigned && (
												<Badge
													variant="default"
													className="bg-green-100 text-green-700"
												>
													<CheckCircle2
														className="h-3 w-3 mr-1"
														aria-hidden="true"
													/>
													Assigned
												</Badge>
											)}
										</div>
										{campaign.description && (
											<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
												{campaign.description}
											</p>
										)}
										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
											<span>
												${Number(campaign.raised).toLocaleString()} raised of $
												{Number(campaign.goal).toLocaleString()}
											</span>
											<span>•</span>
											<span>{campaign.investors} supporters</span>
											{campaign.status && (
												<>
													<span>•</span>
													<Badge variant="outline" className="text-xs">
														{campaign.status}
													</Badge>
												</>
											)}
										</div>
									</div>
									<Button
										variant={isAssigned ? 'outline' : 'default'}
										size="sm"
										onClick={() =>
											handleToggleAssignment(campaign.id, isAssigned)
										}
										disabled={isUpdating}
										className="shrink-0"
									>
										{isUpdating ? (
											<>Updating…</>
										) : isAssigned ? (
											<>
												<XCircle
													className="h-4 w-4 mr-1.5"
													aria-hidden="true"
												/>
												Unassign
											</>
										) : (
											<>
												<CheckCircle2
													className="h-4 w-4 mr-1.5"
													aria-hidden="true"
												/>
												Assign
											</>
										)}
									</Button>
								</div>
							</motion.div>
						)
					})}
				</div>
			)}
		</>
	)
}
