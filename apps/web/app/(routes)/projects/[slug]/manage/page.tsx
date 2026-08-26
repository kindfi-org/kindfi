import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getServerSession } from 'next-auth'
import { ProjectManageOverview } from '~/components/sections/projects/manage/project-manage-overview'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectManagementDashboardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()
	const session = await getServerSession(nextAuthOption)
	const admin = session?.user?.id ? await isPlatformAdmin(session.user.id) : false

	await prefetchManagedProjectQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ProjectManageOverview slug={slug} isPlatformAdmin={admin} />
		</HydrationBoundary>
	)
}
