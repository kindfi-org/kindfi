import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { ReactNode } from 'react'
import { FoundationManageCommandCenter } from '~/components/sections/foundations/manage/foundation-manage-command-center'
import { Web3Providers } from '~/components/shared/layout/web3-providers'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { canUserManageFoundation } from '~/lib/queries/foundations/can-user-manage-foundation'
import { getFoundationManageMeta } from '~/lib/queries/foundations/get-foundation-manage-meta'

export default async function FoundationManageLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const [session, supabase] = await Promise.all([
		getServerSession(nextAuthOption),
		createSupabaseServerClient(),
	])

	const foundationMeta = await getFoundationManageMeta(supabase, slug)
	if (!foundationMeta) {
		notFound()
	}

	const userId = session?.user?.id
	const canManage = await canUserManageFoundation(
		foundationMeta.id,
		foundationMeta.founderId,
		userId,
	)

	if (!canManage) {
		redirect(`/foundations/${slug}`)
	}

	return (
		<Web3Providers>
			<section
				className="container mx-auto px-4 py-6 md:py-8 max-w-5xl"
				aria-label="Foundation management"
			>
				<FoundationManageCommandCenter slug={slug} foundationName={foundationMeta.name} />
				<main className="min-w-0 pt-6">{children}</main>
			</section>
		</Web3Providers>
	)
}
