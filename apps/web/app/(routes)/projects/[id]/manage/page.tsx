import { Hero } from '~/components/sections/project/pitch/hero'
import { TipsSidebar } from '~/components/sections/project/pitch/tips-sidebar'
import { UpcomingSteps } from '~/components/sections/project/pitch/upcoming-steps'

export default function ProjectManagementDashboardPage() {
	return (
		<div className="px-4 py-8 max-w-2xl lg:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] justify-center gap-8">
			<div className="space-y-8">
				<Hero />
				<UpcomingSteps />
			</div>

			<TipsSidebar />
		</div>
	)
}
