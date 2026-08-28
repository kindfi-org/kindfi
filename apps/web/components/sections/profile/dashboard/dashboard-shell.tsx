'use client'

import { Suspense } from 'react'
import { SectionContainer } from '~/components/shared/section-container'
import { ProfileShell } from '../profile-shell'
import { DashboardNav, type DashboardSection } from './dashboard-nav'
import { SectionLoadingSkeleton } from './loading-skeleton'

interface DashboardShellProps {
	activeSection: DashboardSection
	header: React.ReactNode
	children: React.ReactNode
}

export function DashboardShell({ activeSection, header, children }: DashboardShellProps) {
	return (
		<ProfileShell>
			<SectionContainer maxWidth="6xl" className="py-8 sm:py-10 lg:py-12">
				<div className="space-y-6">
					{/* Profile header */}
					{header}

					{/* Layout: sidebar + content */}
					<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
						{/* Sidebar navigation */}
						<div className="lg:sticky lg:top-6">
							<Suspense fallback={null}>
								<DashboardNav activeSection={activeSection} />
							</Suspense>
						</div>

						{/* Main content */}
						<main className="min-w-0 flex-1" id="dashboard-main" tabIndex={-1}>
							<Suspense fallback={<SectionLoadingSkeleton />}>{children}</Suspense>
						</main>
					</div>
				</div>
			</SectionContainer>
		</ProfileShell>
	)
}
