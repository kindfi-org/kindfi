import { ClockIcon, LoaderIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Label } from '~/components/base/label'
import type { KycReview } from '~/lib/types/dashboard'

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
			<Label id="review-history-heading" className="text-base font-medium">
				Review History
			</Label>
			{isLoading ? (
				<div
					className="flex items-center justify-center py-8"
					aria-label="Loading reviews"
				>
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
					{reviews.map((review) => (
						<article
							key={review.id}
							className="rounded-lg border p-4 space-y-3"
						>
							<div className="flex items-center justify-between">
								<Badge
									variant="outline"
									className={
										review.decision === 'approved'
											? 'text-green-600'
											: 'text-red-600'
									}
								>
									{review.decision.charAt(0).toUpperCase() +
										review.decision.slice(1)}
								</Badge>
								<time className="text-xs text-muted-foreground">
									{new Date(review.created_at).toLocaleDateString()}
								</time>
							</div>
							<div className="space-y-2">
								<div>
									<Label className="text-xs font-medium text-muted-foreground">
										Reviewer
									</Label>
									<p className="text-sm">{review.reviewer_id}</p>
								</div>
								<div>
									<Label className="text-xs font-medium text-muted-foreground">
										Review Notes
									</Label>
									<p className="text-sm">{review.review_notes}</p>
								</div>
								{review.additional_notes && (
									<div>
										<Label className="text-xs font-medium text-muted-foreground">
											Additional Notes
										</Label>
										<p className="text-sm">{review.additional_notes}</p>
									</div>
								)}
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	)
}
