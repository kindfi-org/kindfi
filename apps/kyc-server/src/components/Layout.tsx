import { Suspense } from 'react'
import { DashboardSkeleton } from './dashboard/skeletons/dashboard-skeleton'
import Header from './Header'

interface LayoutProps {
	children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
			<div className="flex flex-col">
				<Header />
				<main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
					<Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
				</main>
			</div>
		</div>
	)
}

export default Layout
