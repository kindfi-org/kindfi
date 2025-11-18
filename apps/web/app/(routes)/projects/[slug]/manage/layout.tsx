import type { ReactNode } from 'react'
import { ManageNavigation } from '~/components/sections/projects/manage/manage-navigation'

export default async function ManageLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return (
		<section className="container mx-auto px-4 py-8 md:py-12">
			<ManageNavigation slug={slug} />
			<main className="min-w-0">{children}</main>
		</section>
	)
}
