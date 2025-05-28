import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../libs/db'
import { kycReviews } from '../schema/kyc'
import type { NewKYCReview } from '../schema/kyc'

// Validation schemas
const createReviewSchema = z.object({
	user_id: z.string(),
	status: z.enum(['pending', 'approved', 'rejected']),
	verification_level: z.enum(['basic', 'enhanced']),
	reviewer_id: z.string().optional(),
	notes: z.string().optional(),
})

const updateReviewSchema = createReviewSchema.partial()

// Route handlers
export const kycReviewRoutes = {
	// Create a new KYC review
	'POST /api/kyc-reviews': async (req: Request) => {
		const body = await req.json()
		const validatedData = createReviewSchema.parse(body)
		const db = await getDb()

		const newReview: NewKYCReview = {
			...validatedData,
			created_at: new Date(),
			updated_at: new Date(),
		}

		const [review] = await db.insert(kycReviews).values(newReview).returning()
		return new Response(JSON.stringify(review), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		})
	},

	// Get all KYC reviews
	'GET /api/kyc-reviews': async () => {
		const db = await getDb()
		const reviews = await db.select().from(kycReviews)
		return new Response(JSON.stringify(reviews), {
			headers: { 'Content-Type': 'application/json' },
		})
	},

	// Get a specific KYC review by ID
	'GET /api/kyc-reviews/:id': async (req: Request) => {
		const id = req.url.split('/').pop()
		if (!id) {
			return new Response('Review ID is required', { status: 400 })
		}

		const db = await getDb()
		const [review] = await db
			.select()
			.from(kycReviews)
			.where(eq(kycReviews.id, id))

		if (!review) {
			return new Response('Review not found', { status: 404 })
		}

		return new Response(JSON.stringify(review), {
			headers: { 'Content-Type': 'application/json' },
		})
	},

	// Update a KYC review
	'PATCH /api/kyc-reviews/:id': async (req: Request) => {
		const id = req.url.split('/').pop()
		if (!id) {
			return new Response('Review ID is required', { status: 400 })
		}

		const body = await req.json()
		const validatedData = updateReviewSchema.parse(body)
		const db = await getDb()

		const [updatedReview] = await db
			.update(kycReviews)
			.set({
				...validatedData,
				updated_at: new Date(),
			})
			.where(eq(kycReviews.id, id))
			.returning()

		if (!updatedReview) {
			return new Response('Review not found', { status: 404 })
		}

		return new Response(JSON.stringify(updatedReview), {
			headers: { 'Content-Type': 'application/json' },
		})
	},

	// Delete a KYC review
	'DELETE /api/kyc-reviews/:id': async (req: Request) => {
		const id = req.url.split('/').pop()
		if (!id) {
			return new Response('Review ID is required', { status: 400 })
		}

		const db = await getDb()
		const [deletedReview] = await db
			.delete(kycReviews)
			.where(eq(kycReviews.id, id))
			.returning()

		if (!deletedReview) {
			return new Response('Review not found', { status: 404 })
		}

		return new Response(JSON.stringify(deletedReview), {
			headers: { 'Content-Type': 'application/json' },
		})
	},
} 