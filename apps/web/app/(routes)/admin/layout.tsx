import { isAdminOpsDashboardEnabled } from '@packages/lib/admin'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { AdminNavigation } from '~/components/sections/admin/admin-navigation'
import { AdminBreadcrumbs } from '~/components/sections/admin/nav/admin-breadcrumbs'
import { AdminSidebar } from '~/components/sections/admin/nav/admin-sidebar'
import { Web3Providers } from '~/components/shared/layout/web3-providers'
import { requireAdmin } from '~/lib/utils/admin'

function SkipLink() {
	return (
		<Link
			href="#admin-main"
			className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		>
			Skip to main content
		</Link>
	)
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
	await requireAdmin()

	if (isAdminOpsDashboardEnabled()) {
		return (
			<Web3Providers>
				<div className="min-h-screen bg-muted/30">
					<SkipLink />
					<div className="container mx-auto px-4 py-6 sm:py-8">
						<div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
							<AdminSidebar />
							<div className="min-w-0 flex-1 space-y-3">
								<AdminBreadcrumbs />
								<main
									id="admin-main"
									className="min-w-0 scroll-mt-8 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:p-8"
									tabIndex={-1}
								>
									{children}
								</main>
							</div>
						</div>
					</div>
				</div>
			</Web3Providers>
		)
	}

	return (
		<Web3Providers>
			<div className="min-h-screen bg-muted/30">
				<SkipLink />
				<div className="container mx-auto px-4 py-6 sm:py-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
						<aside
							className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56 lg:self-start"
							aria-label="Admin navigation"
						>
							<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
								<AdminNavigation />
							</div>
						</aside>
						<main
							id="admin-main"
							className="min-w-0 flex-1 scroll-mt-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
							tabIndex={-1}
						>
							{children}
						</main>
					</div>
				</div>
			</div>
		</Web3Providers>
	)
}
