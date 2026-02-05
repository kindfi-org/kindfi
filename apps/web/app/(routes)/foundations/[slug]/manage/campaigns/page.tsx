import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { FoundationCampaignsWrapper } from '~/components/sections/foundations/manage/foundation-campaigns-wrapper'
import { ManagePageShell } from '~/components/sections/foundations/manage/shared/manage-page-shell'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function FoundationCampaignsPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const supabase = await createSupabaseServerClient()
	const foundation = await getFoundationBySlug(supabase, slug)

	if (!foundation) {
		return (
			<ManagePageShell>
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold mb-2">Foundation Not Found</h2>
					<p className="text-muted-foreground">
						The foundation you&apos;re looking for doesn&apos;t exist or has
						been removed.
					</p>
				</div>
			</ManagePageShell>
		)
	}

	return (
		<ManagePageShell>
			<FoundationCampaignsWrapper
				foundationSlug={slug}
				foundationId={foundation.id}
			/>
		</ManagePageShell>
	)
}
