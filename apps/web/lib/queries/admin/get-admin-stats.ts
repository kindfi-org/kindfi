import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getAdminStats(client: TypedSupabaseClient) {
	// Get all stats in parallel
	const [
		projectsResult,
		foundationsResult,
		usersResult,
		escrowsResult,
		projectsByStatus,
		usersByRole,
		donationsData,
		contributionsData,
	] = await Promise.all([
		client.from('projects').select('id', { count: 'exact', head: true }),
		client.from('foundations').select('id', { count: 'exact', head: true }),
		client.from('profiles').select('id', { count: 'exact', head: true }),
		client
			.from('escrow_contracts')
			.select('id', { count: 'exact', head: true }),
		client.from('projects').select('status, id'),
		client.from('profiles').select('role, id'),
		client.from('projects').select('current_amount, target_amount, status'),
		client.from('contributions').select('amount, project_id'),
	])

	// Calculate projects by status
	const projectsByStatusMap: Record<string, number> = {}
	projectsByStatus.data?.forEach((project) => {
		const status = (project as { status?: string }).status || 'unknown'
		projectsByStatusMap[status] = (projectsByStatusMap[status] || 0) + 1
	})

	// Calculate users by role
	const usersByRoleMap: Record<string, number> = {}
	usersByRole.data?.forEach((user) => {
		const role = (user as { role?: string }).role || 'unknown'
		usersByRoleMap[role] = (usersByRoleMap[role] || 0) + 1
	})

	// Calculate total donations and funding stats
	const totalDonations =
		donationsData?.data?.reduce(
			(sum, p) => sum + Number(p.current_amount || 0),
			0,
		) || 0

	const totalTarget =
		donationsData?.data?.reduce(
			(sum, p) => sum + Number(p.target_amount || 0),
			0,
		) || 0

	const totalContributions =
		contributionsData?.data?.reduce(
			(sum, c) => sum + Number(c.amount || 0),
			0,
		) || 0

	// Calculate active projects funding stats
	const activeProjectsData =
		donationsData?.data?.filter(
			(p) => (p as { status?: string }).status === 'active',
		) || []
	const activeProjectsRaised = activeProjectsData.reduce(
		(sum, p) => sum + Number(p.current_amount || 0),
		0,
	)
	const activeProjectsTarget = activeProjectsData.reduce(
		(sum, p) => sum + Number(p.target_amount || 0),
		0,
	)

	// Get recent activity (last 7 days)
	const sevenDaysAgo = new Date()
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

	const [recentProjects, recentFoundations, recentUsers, recentContributions] =
		await Promise.all([
			client
				.from('projects')
				.select('id, created_at, status')
				.gte('created_at', sevenDaysAgo.toISOString()),
			client
				.from('foundations')
				.select('id, created_at')
				.gte('created_at', sevenDaysAgo.toISOString()),
			client
				.from('profiles')
				.select('id, created_at, role')
				.gte('created_at', sevenDaysAgo.toISOString()),
			client
				.from('contributions')
				.select('id, created_at, amount')
				.gte('created_at', sevenDaysAgo.toISOString()),
		])

	// Calculate recent activity breakdowns
	const recentProjectsByStatus: Record<string, number> = {}
	recentProjects.data?.forEach((project) => {
		const status = (project as { status?: string }).status || 'unknown'
		recentProjectsByStatus[status] = (recentProjectsByStatus[status] || 0) + 1
	})

	const recentUsersByRole: Record<string, number> = {}
	recentUsers.data?.forEach((user) => {
		const role = (user as { role?: string }).role || 'unknown'
		recentUsersByRole[role] = (recentUsersByRole[role] || 0) + 1
	})

	const recentContributionsTotal =
		recentContributions.data?.reduce(
			(sum, c) => sum + Number(c.amount || 0),
			0,
		) || 0

	return {
		// Totals
		totalProjects: projectsResult.count || 0,
		totalFoundations: foundationsResult.count || 0,
		totalUsers: usersResult.count || 0,
		totalEscrows: escrowsResult.count || 0,

		// Projects by status
		projectsByStatus: projectsByStatusMap,
		activeProjects: projectsByStatusMap.active || 0,
		draftProjects: projectsByStatusMap.draft || 0,
		reviewProjects: projectsByStatusMap.review || 0,
		pausedProjects: projectsByStatusMap.paused || 0,
		fundedProjects: projectsByStatusMap.funded || 0,
		rejectedProjects: projectsByStatusMap.rejected || 0,

		// Users by role
		usersByRole: usersByRoleMap,
		adminUsers: usersByRoleMap.admin || 0,
		creatorUsers: usersByRoleMap.creator || 0,
		donorUsers: usersByRoleMap.donor || 0,
		kinderUsers: usersByRoleMap.kinder || 0,
		kindlerUsers: usersByRoleMap.kindler || 0,
		pendingUsers: usersByRoleMap.pending || 0,

		// Funding statistics
		totalDonations,
		totalTarget,
		totalContributions,
		fundingProgress: totalTarget > 0 ? (totalDonations / totalTarget) * 100 : 0,
		activeProjectsRaised,
		activeProjectsTarget,
		activeProjectsProgress:
			activeProjectsTarget > 0
				? (activeProjectsRaised / activeProjectsTarget) * 100
				: 0,

		// Recent activity (last 7 days)
		recentActivity: {
			projects: recentProjects.data?.length || 0,
			projectsByStatus: recentProjectsByStatus,
			foundations: recentFoundations.data?.length || 0,
			users: recentUsers.data?.length || 0,
			usersByRole: recentUsersByRole,
			contributions: recentContributions.data?.length || 0,
			contributionsAmount: recentContributionsTotal,
		},
	}
}
