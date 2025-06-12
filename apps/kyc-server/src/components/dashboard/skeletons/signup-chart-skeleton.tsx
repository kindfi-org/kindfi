import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'

export function SignupChartSkeleton() {
	return (
		<Card className="@container/card">
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle>
						<Skeleton className="h-6 w-40" />
					</CardTitle>
					<CardDescription>
						<Skeleton className="h-4 w-60" />
					</CardDescription>
				</div>

				<div className="mt-2 sm:mt-0">
					<Skeleton className="h-8 w-36 rounded-lg" />
				</div>
			</CardHeader>

			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<div className="aspect-auto h-[250px] w-full">
					<Skeleton className="h-full w-full rounded-lg" />
				</div>
			</CardContent>
		</Card>
	)
}
