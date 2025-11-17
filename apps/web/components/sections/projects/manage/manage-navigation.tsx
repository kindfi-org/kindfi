'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoChevronBackOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'

interface ManageNavigationProps {
	slug: string
}

export function ManageNavigation({ slug }: ManageNavigationProps) {
	const pathname = usePathname()
	
	// Check if we're on the main manage page (exactly /projects/[slug]/manage)
	const isMainManagePage = pathname === `/projects/${slug}/manage`

	return (
		<div className="mb-6 flex items-center gap-2">
			{isMainManagePage ? (
				<Link href={`/projects/${slug}`} className="inline-block">
					<Button variant="ghost" startIcon={<IoChevronBackOutline />}>
						Back to project
					</Button>
				</Link>
			) : (
				<Link href={`/projects/${slug}/manage`} className="inline-block">
					<Button variant="ghost" startIcon={<IoChevronBackOutline />}>
						Back to manage
					</Button>
				</Link>
			)}
		</div>
	)
}

