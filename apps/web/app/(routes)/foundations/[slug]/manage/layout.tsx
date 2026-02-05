import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { ReactNode } from 'react'
import { FoundationManageCommandCenter } from '~/components/sections/foundations/manage/foundation-manage-command-center'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function FoundationManageLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const supabase = await createSupabaseServerClient()
	const foundation = await getFoundationBySlug(supabase, slug)

	return (
		<section
			className="container mx-auto px-4 py-6 md:py-8 max-w-5xl"
			aria-label="Foundation management"
		>
			<FoundationManageCommandCenter
				slug={slug}
				foundationName={foundation?.name ?? null}
			/>
			<main className="min-w-0 pt-6">{children}</main>
		</section>
	)
}
