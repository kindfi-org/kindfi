'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { useProjectsFundingBalances } from '~/hooks/projects/use-projects-funding-balances'
import type { ProjectListItem } from '~/lib/queries/projects/get-all-projects'
import { formatDistanceToNow } from '~/lib/utils/date-utils'
import { coerceNumericAmount } from '~/lib/utils/format-currency'
import { formatProjectFundingAmount, projectHasEscrow } from '~/lib/utils/projects/project-funding'

const formatGoal = (value: number | null | undefined) =>
	formatProjectFundingAmount(coerceNumericAmount(value) ?? 0, {
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
	})

const SKELETON_KEYS = ['proj-sk-1', 'proj-sk-2', 'proj-sk-3', 'proj-sk-4', 'proj-sk-5'] as const

const fetchAdminProjects = async () => {
	const response = await fetch('/api/admin/projects')
	if (!response.ok) {
		throw new Error('Failed to load projects')
	}
	return (await response.json()) as ProjectListItem[]
}

export function AdminProjectsList() {
	const {
		data: projects,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['supabase', 'admin-projects'],
		queryFn: fetchAdminProjects,
	})

	const { getDisplayRaised } = useProjectsFundingBalances(projects ?? [])

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<div className="h-8 w-56 bg-muted animate-pulse rounded" />
					<div className="mt-2 h-4 w-72 bg-muted animate-pulse rounded" />
				</div>
				<div className="space-y-2">
					{SKELETON_KEYS.map((key) => (
						<div key={key} className="h-20 rounded-lg bg-muted/60 animate-pulse" />
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="space-y-6">
				<AdminSectionHeader
					title="Projects"
					description="View and manage all projects on the platform"
				/>
				<Card className="border-destructive/50">
					<CardContent className="py-12 text-center">
						<p className="font-medium text-destructive">Error loading projects.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Refresh the page or try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const statusColors: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-800',
		review: 'bg-yellow-100 text-yellow-800',
		active: 'bg-green-200 text-green-800',
		paused: 'bg-orange-100 text-orange-800',
		funded: 'bg-blue-100 text-blue-800',
		rejected: 'bg-red-100 text-red-800',
	}

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Projects"
				description="View and manage all projects on the platform"
			>
				<Button asChild>
					<Link href="/admin/projects/create">Create dev project</Link>
				</Button>
			</AdminSectionHeader>

			<div className="space-y-2">
				{projects?.map((project) => (
					<Card key={project.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<Link
											href={`/projects/${project.slug}`}
											className="font-semibold hover:underline"
										>
											{project.title}
										</Link>
										<Badge className={statusColors[project.status || 'draft']}>
											{project.status || 'draft'}
										</Badge>
										{project.developmentOnly ? (
											<Badge
												variant="secondary"
												className="bg-amber-100 text-amber-900 hover:bg-amber-100"
											>
												Development only
											</Badge>
										) : null}
									</div>
									<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
										<span>
											Raised:{' '}
											{formatProjectFundingAmount(getDisplayRaised(project), {
												hasEscrow: projectHasEscrow(project),
											})}{' '}
											/ {formatGoal(project.goal)}
										</span>
										<span>•</span>
										<span>{project.investors} supporters</span>
										<span>•</span>
										<span>
											{project.createdAt
												? formatDistanceToNow(new Date(project.createdAt))
												: 'Unknown'}
										</span>
									</div>
								</div>
								<div className="flex gap-2">
									<Link
										href={`/projects/${project.slug}/manage`}
										className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
									>
										Manage
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{projects?.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">No projects found.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Projects will appear here once creators start campaigns.
						</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
