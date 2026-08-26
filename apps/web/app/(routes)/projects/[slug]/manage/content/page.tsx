import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ContentWizardWrapper } from '~/components/sections/projects/content-wizard/content-wizard-wrapper'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectContentWizardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	const basicInfo = await getBasicProjectInfoBySlug(supabaseServiceRole, slug, {
		localize: false,
	})

	await prefetchManagedProjectQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug, { localize: false }),
		[slug],
	)

	if (basicInfo?.id) {
		await prefetchManagedProjectQuery(
			queryClient,
			'project-pitch',
			(client) => getProjectPitchDataBySlug(client, slug, { localize: false }),
			[slug],
		)
	}

	await prefetchManagedProjectQuery(
		queryClient,
		'project-highlights',
		(client) => getProjectHighlights(client, slug, { localize: false }),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ContentWizardWrapper slug={slug} />
		</HydrationBoundary>
	)
}
