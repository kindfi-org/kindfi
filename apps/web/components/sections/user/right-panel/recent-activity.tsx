'use client'

import { ScrollArea } from '@radix-ui/react-scroll-area'
import { ChevronRight, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/base/button'
import { mockActivities } from '~/lib/constants/mock-data/right-panel-mocks'

export function RecentActivity() {
	const router = useRouter()

	return (
		<section className="space-y-4" aria-labelledby="recent-activity-title">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
					<h3 id="recent-activity-title" className="text-sm font-medium">
						Recent Activity
					</h3>
				</div>
				<Button
					variant="link"
					className="text-sm text-primary p-0 h-auto"
					aria-label="View all activities"
				>
					View All
				</Button>
			</div>

			<ScrollArea
				className="h-[200px] w-full rounded-md border"
				aria-label="Recent activities list"
			>
				<div className="p-4" role="feed" aria-busy="false">
					<div className="space-y-2">
						{mockActivities.map((activity) => (
							<button
								type="button"
								key={activity.id}
								className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								onClick={() => router.push(`/activity/${activity.id}`)}
								aria-label={`${activity.title} - ${activity.timestamp}`}
							>
								<div className="flex items-center gap-3 min-w-0">
									<activity.icon
										className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
										aria-hidden="true"
									/>
									<div className="text-left min-w-0">
										<p className="text-sm font-medium truncate">
											{activity.title}
										</p>
										<time
											className="text-xs text-muted-foreground block"
											dateTime={activity.timestamp}
										>
											{activity.timestamp}
										</time>
									</div>
								</div>
								<ChevronRight
									className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary ml-2"
									aria-hidden="true"
								/>
							</button>
						))}
					</div>
				</div>
			</ScrollArea>
		</section>
	)
}
