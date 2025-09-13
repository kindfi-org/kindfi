import { UserMetricsGrid } from '~/components/dashboard/cards/user-metrics-grid'
import { UserTable } from '~/components/dashboard/table/user-table'

export default function Users() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2 bg-background">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">KYC User Management</h1>
					<p className="text-muted-foreground">
						Manage and review user KYC applications with real-time updates.
					</p>
				</div>
				<UserMetricsGrid />
				<UserTable />
			</div>
		</div>
	)
}