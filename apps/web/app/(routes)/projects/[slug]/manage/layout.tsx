import Link from 'next/link'
import type { ReactNode } from 'react'
import { IoChevronBackOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'

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
			<div className="mb-6">
				<Link href={`/projects/${slug}`} className="inline-block">
					<Button variant="ghost" startIcon={<IoChevronBackOutline />}>
						Back to project
					</Button>
				</Link>
			</div>
			<main className="min-w-0">{children}</main>
		</section>
	)
}
