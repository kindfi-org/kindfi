'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '~/components/base/breadcrumb'

const SEGMENT_LABELS: Record<string, string> = {
	admin: 'Admin',
	projects: 'Projects',
	escrows: 'Escrows',
	'milestone-reviews': 'Milestone Reviews',
	users: 'Users & KYC',
	foundations: 'Foundations',
	governance: 'Governance',
	gamification: 'Gamification',
	compliance: 'Compliance',
	analytics: 'Analytics',
	settings: 'Settings',
	create: 'Create',
}

/**
 * Breadcrumb trail derived from the current admin path, so admins always
 * know where they are and can step back up the hierarchy.
 */
export function AdminBreadcrumbs() {
	const pathname = usePathname()
	const segments = (pathname ?? '').split('/').filter(Boolean)

	if (segments.length <= 1 || segments[0] !== 'admin') return null

	const crumbs = segments.map((segment, index) => ({
		label: SEGMENT_LABELS[segment] ?? segment,
		href: `/${segments.slice(0, index + 1).join('/')}`,
		isLast: index === segments.length - 1,
	}))

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{crumbs.map((crumb) => (
					<React.Fragment key={crumb.href}>
						<BreadcrumbItem>
							{crumb.isLast ? (
								<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{!crumb.isLast ? <BreadcrumbSeparator /> : null}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
