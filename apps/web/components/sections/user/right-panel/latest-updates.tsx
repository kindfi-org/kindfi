'use client'

import { Book } from 'lucide-react'
import { Button } from '~/components/base/button'
import { ScrollArea } from '~/components/base/scroll-area'
import { mockUpdates } from '~/lib/mock-data/right-panel-mocks'

export function LatestUpdates() {
	return (
		<section className="space-y-3" aria-labelledby="latest-updates-title">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Book className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
					<h3 id="latest-updates-title" className="text-sm font-medium">
						Latest Updates
					</h3>
				</div>
				<Button
					variant="link"
					className="text-sm text-primary p-0 h-auto"
					aria-label="View all updates"
				>
					View All
				</Button>
			</div>

			<ScrollArea
				className="h-[180px] xs:h-[200px] w-full rounded-md border"
				aria-label="Latest project updates"
			>
				<div className="p-3 space-y-3" role="feed" aria-busy="false">
					{mockUpdates.map((update) => (
						<article
							key={update.id}
							className="space-y-1 border-b border-border pb-3 last:border-0"
						>
							<div className="flex items-center justify-between gap-4">
								<h4 className="text-sm font-medium line-clamp-1">
									{update.title}
								</h4>
								<time
									className="text-xs text-muted-foreground whitespace-nowrap"
									dateTime={update.timestamp}
								>
									{update.timestamp}
								</time>
							</div>
							{/** biome-ignore lint/a11y/useAriaPropsSupportedByRole:any */}
							<p
								className="text-xs text-muted-foreground line-clamp-2"
								aria-label={`Update description: ${update.description}`}
							>
								{update.description}
							</p>
						</article>
					))}
				</div>
			</ScrollArea>
		</section>
	)
}
