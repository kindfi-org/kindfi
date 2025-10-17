import type { ReactNode } from 'react'
import { ManageNav } from '../../../../../components/sections/projects/manage/manage-nav'
import { Card } from '~/components/base/card'

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
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
				<aside className="lg:sticky lg:top-24 h-fit">
					<Card className="p-4">
						<ManageNav slug={slug} />
					</Card>
				</aside>
				<main className="min-w-0">{children}</main>
			</div>
		</section>
	)
}
