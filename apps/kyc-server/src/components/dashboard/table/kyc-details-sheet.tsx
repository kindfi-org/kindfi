'use client'

import { useEffect, useState } from 'react'

import { Button } from '~/components/base/button'
import { Separator } from '~/components/base/separator'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/base/sheet'
import { mockKycReviews } from '~/lib/mock-data/dashboard'
import type { KycRecord } from '~/lib/types/dashboard'
import { AddReviewForm } from './add-review-form'
import { KycDetailsForm } from './kyc-details-form'
import { ReviewHistory } from './review-history'

interface KycDetailsSheetProps {
	item: KycRecord
}

export function KycDetailsSheet({ item }: KycDetailsSheetProps) {
	const [isLoading, setIsLoading] = useState(false)

	// Simulate loading state
	useEffect(() => {
		setIsLoading(true)
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)
		return () => clearTimeout(timer)
	}, [])

	const shortUserId = item.userId.split('-').pop()

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="link"
					className="w-fit px-0 text-left text-foreground cursor-pointer"
					aria-label={`View details for user ${item.userId}`}
				>
					...
					{shortUserId?.substring(shortUserId.length - 6, shortUserId.length)}
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="flex flex-col"
				aria-describedby="kyc-details-description"
			>
				<SheetHeader className="gap-1">
					<SheetTitle>KYC Details - {item.userId}</SheetTitle>
					<SheetDescription id="kyc-details-description">
						User verification status and review history
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
					{/* User Details Form */}
					<KycDetailsForm item={item} />

					<Separator />

					{/* KYC Reviews Section */}
					<ReviewHistory isLoading={isLoading} reviews={mockKycReviews} />

					<Separator />

					{/* Add Review Section */}
					<AddReviewForm userId={item.userId} />
				</div>
			</SheetContent>
		</Sheet>
	)
}
