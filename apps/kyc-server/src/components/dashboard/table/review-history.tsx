import { ClockIcon, LoaderIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Label } from '~/components/base/label'
import { STATUS_OPTIONS } from '~/lib/constants/dashboard'
import type { KycReview } from '~/lib/types/dashboard'
import { cn } from '~/lib/utils'

interface ReviewHistoryProps {
	isLoading: boolean
	reviews: KycReview[]
}

export function ReviewHistory({ isLoading, reviews }: ReviewHistoryProps) {
	return (
		<section
			className="flex flex-col gap-3"
			aria-labelledby="review-history-heading"
		>
			<h2 id="review-history-heading" className="text-base font-medium">
				Review History
			</h2>
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<LoaderIcon
						className="size-6 animate-spin text-muted-foreground"
						aria-hidden="true"
					/>
					<span className="ml-2 text-muted-foreground">Loading reviews...</span>
				</div>
			) : reviews.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<ClockIcon
						className="size-8 text-muted-foreground mb-2"
						aria-hidden="true"
					/>
					<p className="text-muted-foreground">No reviews available</p>
					<p className="text-sm text-muted-foreground">
						Reviews will appear here once the KYC process begins
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{reviews.length ? (
						reviews.map((review) => (
							<article
								key={review.id}
								className="rounded-lg border p-4 space-y-3"
							>
								<div className="flex items-center justify-between">
									{review.status && (
										<Badge
											variant="outline"
											className={cn(
												'text-sm inline-flex items-center gap-1',
												STATUS_OPTIONS[review.status].color,
												STATUS_OPTIONS[review.status].borderColor,
												STATUS_OPTIONS[review.status].bgColor,
											)}
										>
											{(() => {
												const Icon = STATUS_OPTIONS[review.status].icon
												return (
													<Icon
														className="inline mr-1 size-4 align-text-bottom"
														aria-hidden="true"
													/>
												)
											})()}
											{STATUS_OPTIONS[review.status].label}
										</Badge>
									)}
									<time
										className="text-xs text-muted-foreground"
										dateTime={review.createdAt}
									>
										{new Intl.DateTimeFormat(undefined, {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										}).format(new Date(review.createdAt))}
									</time>
								</div>

								<div>
									<p className="text-xs text-muted-foreground m-0">Reviewer</p>
									<p className="text-sm font-medium">
										{review.reviewerId || 'KindFi Admins'}
									</p>
								</div>

								<div className="space-y-2">
									<Label className="text-xs text-muted-foreground m-0">
										Review Notes
									</Label>
									<p className="text-sm font-medium">
										{review.notes || 'No additional notes provided'}
									</p>
								</div>
							</article>
						))
					) : (
						<div className="text-center text-muted-foreground py-8">
							No previous reviews found.
						</div>
					)}
				</div>
			)}
		</section>
	)
}
