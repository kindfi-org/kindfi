import { UserMetricsGrid } from '~/components/dashboard/cards/user-metrics-grid'
import { UserTable } from '~/components/dashboard/table/user-table'

export default function Customers() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<UserMetricsGrid />
				<UserTable />
			</div>
		</div>
	)
}
