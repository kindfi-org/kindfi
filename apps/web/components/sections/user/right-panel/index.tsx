/** biome-ignore-all lint/a11y/useSemanticElements: any */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import { Suspense, useState } from 'react'
import { Card } from '~/components/base/card'
import { ScrollArea } from '~/components/base/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '~/components/base/tabs'
import type { DashboardMode } from '~/lib/types'
import {
	ActivitySkeleton,
	LatestUpdates,
	NavigationMenu,
	NavigationSkeleton,
	RecentActivity,
	UpdatesSkeleton,
} from './lazy-components'

export function RightPanel() {
	const [mode, setMode] = useState<DashboardMode>('user')

	return (
		<Card
			className="w-full h-full bg-background p-2 rounded-none md:rounded-lg"
			role="complementary"
			aria-label="Dashboard side panel"
		>
			<div className="flex flex-col h-auto md:h-full pt-2">
				<div className="px-2 pb-2">
					<Tabs
						value={mode}
						onValueChange={(value: string) => setMode(value as DashboardMode)}
						className="w-full"
						aria-label="Dashboard mode selection"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger
								value="user"
								aria-label="Switch to user mode"
								className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								User
							</TabsTrigger>
							<TabsTrigger
								value="creator"
								aria-label="Switch to creator mode"
								className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								Creator
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				<ScrollArea className="flex-1 px-2" aria-label="Dashboard content">
					<div className="space-y-6 py-2" aria-label="Dashboard sections">
						<Suspense fallback={<NavigationSkeleton />}>
							<NavigationMenu mode={mode} />
						</Suspense>

						<Suspense fallback={<UpdatesSkeleton />}>
							<LatestUpdates />
						</Suspense>

						<Suspense fallback={<ActivitySkeleton />}>
							<RecentActivity />
						</Suspense>
					</div>
				</ScrollArea>
			</div>
		</Card>
	)
}
