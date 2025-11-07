'use client'

import { useCallback, useState } from 'react'
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
import type { KycRecord, KycReview, UserDetails } from '~/lib/types/dashboard'
import { mapUserDetailsToFormData } from '~/lib/utils'
import { AddReviewForm } from './add-review-form'
import { KycDetailsForm } from './kyc-details-form'
import { ReviewHistory } from './review-history'

export function KycDetailsSheet({ item }: KycDetailsSheetProps) {
	const [refreshKey, setRefreshKey] = useState(0)
	const [isLoadingReviews, setIsLoadingReviews] = useState(false)
	const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false)
	const [reviews, setReviews] = useState<KycReview[]>([])
	const [userDetail, setUserDetail] = useState<UserDetails | null>(null)
	const [reviewsError, setReviewsError] = useState<Error | null>(null)
	const [userDetailError, setUserDetailError] = useState<Error | null>(null)

	// Fetch reviews
	const fetchReviews = useCallback(async () => {
		setIsLoadingReviews(true)
		setReviewsError(null)
		try {
			const res = await fetch(`/api/users/${item.userId}/reviews`)
			if (!res.ok) throw new Error('Failed to fetch reviews')
			const json = await res.json()
			setReviews(json.data as KycReview[])
		} catch (error) {
			console.error('Error fetching user historical reviews:', error)
			setReviewsError(
				error instanceof Error ? error : new Error('Unknown error'),
			)
		} finally {
			setIsLoadingReviews(false)
		}
	}, [item.userId])

	// Fetch user details
	const fetchUserDetails = useCallback(async () => {
		setIsLoadingUserDetail(true)
		setUserDetailError(null)
		try {
			const res = await fetch(`/api/users/${item.userId}/status`)
			if (!res.ok) throw new Error('Failed to fetch user details')
			const json: { success: boolean; data: UserDetails } = await res.json()
			setUserDetail(json.data)
		} catch (error) {
			console.error('Error fetching user details:', error)
			setUserDetailError(
				error instanceof Error ? error : new Error('Unknown error'),
			)
		} finally {
			setIsLoadingUserDetail(false)
		}
	}, [item.userId])

	// Fetch data when sheet opens
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				fetchReviews()
				fetchUserDetails()
			}
		},
		[fetchReviews, fetchUserDetails],
	)

	// Refresh data after review is added
	const handleReviewAdded = useCallback(() => {
		fetchReviews()
		fetchUserDetails()
		setRefreshKey((prev) => prev + 1)
	}, [fetchReviews, fetchUserDetails])

	const shortUserId = item.userId.split('-').pop()
	const isLoading = isLoadingReviews || isLoadingUserDetail
	const error = reviewsError || userDetailError
	console.log(reviews)
	return (
		<Sheet onOpenChange={handleOpenChange}>
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
				className="flex flex-col max-w-[600px]"
				aria-describedby="kyc-details-description"
			>
				<SheetHeader className="gap-1">
					<SheetTitle className="whitespace-pre-line">
						KYC Details
						{`
						${item.userId}`}
					</SheetTitle>
					<SheetDescription id="kyc-details-description">
						User verification status and review history
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
							<p>Loading user details and reviews...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-8 text-red-500">
							<p className="mb-2">Failed to load data.</p>
							<p className="text-sm">
								{error.message || 'Please try again later.'}
							</p>
						</div>
					) : userDetail ? (
						<>
							{/* User Details Form - using mapped data from API */}
							<KycDetailsForm
								key={refreshKey}
								data={mapUserDetailsToFormData(userDetail)}
							/>

							<Separator />

							{/* KYC Reviews Section */}
							<ReviewHistory
								isLoading={false}
								reviews={
									reviews?.filter(
										(review) => review.id === userDetail.kyc?.id,
									) || []
								}
							/>

							<Separator />

							{/* Add Review Section */}
							<AddReviewForm
								userId={item.userId}
								onReviewAdded={handleReviewAdded}
							/>
						</>
					) : (
						<div className="text-center text-muted-foreground py-8">
							No data found.
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}

interface KycDetailsSheetProps {
	item: KycRecord
}
