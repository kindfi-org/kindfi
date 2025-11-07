import { kycReviews } from '@packages/drizzle'
import { eq } from 'drizzle-orm'
import { getDb } from '~/lib/services/db'
import type { KycReview } from '~/lib/types/dashboard'

export async function fetchKycReviewsByUserId(userId: string) {
	const db = getDb
	const reviews = await db
		.select()
		.from(kycReviews)
		.where(eq(kycReviews.userId, userId))
	return reviews
}
