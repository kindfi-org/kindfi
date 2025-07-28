import { Suspense, useState } from 'react'
import { DashboardSkeleton } from './dashboard/skeletons/dashboard-skeleton'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
	currentPath: string
	navigate: (path: string) => void
	children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ currentPath, navigate, children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
			<Sidebar currentPath={currentPath} navigate={navigate} />
			<div className="flex flex-col">
				<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
				<main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
					<Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
				</main>
			</div>
		</div>
	)
}

export default Layout
