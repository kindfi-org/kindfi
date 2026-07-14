import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { EscrowAdminClientWrapper } from '~/components/sections/projects/manage/escrow/escrow-admin-client-wrapper'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function SettingPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const session = await getServerSession(nextAuthOption)
	const admin = session?.user?.id ? await isPlatformAdmin(session.user.id) : false

	if (!admin) {
		redirect(`/projects/${slug}/manage`)
	}

	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<EscrowAdminClientWrapper projectSlug={slug} />
		</HydrationBoundary>
	)
}
