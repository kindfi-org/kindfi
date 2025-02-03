// apps/web/components/sections/user/right-panel/lazy-components.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '~/components/base/skeleton'

export function NavigationSkeleton() {
	return (
		<div className="space-y-2">
			{[1, 2, 3].map((i) => (
				<Skeleton key={i} className="h-12 w-full" />
			))}
		</div>
	)
}

export function UpdatesSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-6 w-20" />
			</div>
			{[1, 2, 3].map((i) => (
				<Skeleton key={i} className="h-24 w-full" />
			))}
		</div>
	)
}

export function ActivitySkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-6 w-20" />
			</div>
			{[1, 2, 3].map((i) => (
				<Skeleton key={i} className="h-16 w-full" />
			))}
		</div>
	)
}

export const NavigationMenu = dynamic(
	() => import('./navigation-menu').then((mod) => mod.NavigationMenu),
	{
		loading: () => <NavigationSkeleton />,
		ssr: true,
	},
)

export const LatestUpdates = dynamic(
	() => import('./latest-updates').then((mod) => mod.LatestUpdates),
	{
		loading: () => <UpdatesSkeleton />,
		ssr: true,
	},
)

export const RecentActivity = dynamic(
	() => import('./recent-activity').then((mod) => mod.RecentActivity),
	{
		loading: () => <ActivitySkeleton />,
		ssr: true,
	},
)
