'use client'

import { Suspense } from 'react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { AchievementsGrid } from '~/components/sections/achievements/achievement-grid'
import { HighlightedProjects } from '~/components/sections/home/highlighted-projects'
import { ImpactCard } from '~/components/sections/user/impact-generated-section'
import { TransactionHistory } from '~/components/sections/user/transaction-history-section'

interface DonorProfileProps {
	userId: string
	displayName: string
}

export function DonorProfile({ displayName }: DonorProfileProps) {
	return (
		<div className="space-y-8 p-4">
			<header className="space-y-1">
				<h1 className="text-3xl font-bold">{displayName}</h1>
				<p className="text-muted-foreground">Your impact home base</p>
			</header>

			<section className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Total Impact & Stats</CardTitle>
					</CardHeader>
					<CardContent>
						<ImpactCard />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recently Supported Causes</CardTitle>
					</CardHeader>
					<CardContent>
						<Suspense>
							<HighlightedProjects />
						</Suspense>
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Badges & Collection</CardTitle>
					</CardHeader>
					<CardContent>
						<AchievementsGrid />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Donation History</CardTitle>
					</CardHeader>
					<CardContent>
						<TransactionHistory />
					</CardContent>
				</Card>
			</section>
		</div>
	)
}
