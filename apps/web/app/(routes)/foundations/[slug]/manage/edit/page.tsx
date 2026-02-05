import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { notFound } from 'next/navigation'
import { EditFoundationForm } from '~/components/sections/foundations/manage/edit-foundation-form'
import { ManagePageShell } from '~/components/sections/foundations/manage/shared'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function EditFoundationPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const supabase = await createSupabaseServerClient()
	const foundation = await getFoundationBySlug(supabase, slug)

	if (!foundation) {
		notFound()
	}

	return (
		<ManagePageShell>
			<EditFoundationForm
				slug={slug}
				foundation={{
					name: foundation.name,
					description: foundation.description,
					slug: foundation.slug,
					foundedYear: foundation.foundedYear,
					mission: foundation.mission,
					vision: foundation.vision,
					websiteUrl: foundation.websiteUrl,
					socialLinks: foundation.socialLinks ?? {},
					logoUrl: foundation.logoUrl,
				}}
			/>
		</ManagePageShell>
	)
}
