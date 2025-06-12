import type {
	kycReviewsInsertSchema,
	kycReviewsRowSchema,
	kycStatusRowSchema,
	kycStatusUpdateSchema,
} from '@services/supabase'
import type { z } from 'zod'

export type KycRecord = z.infer<typeof kycStatusRowSchema>
export type KycReview = z.infer<typeof kycReviewsRowSchema>
export type kycStatusUpdateValues = z.infer<typeof kycStatusUpdateSchema>
export type kycReviewsInsertValues = z.infer<typeof kycReviewsInsertSchema>

export interface KycStats {
	totalUsers: number
	pending: number
	approved: number
	rejected: number
	trends: {
		totalUsers: { value: number; isPositive: boolean }
		pending: { value: number; isPositive: boolean }
		approved: { value: number; isPositive: boolean }
		rejected: { value: number; isPositive: boolean }
	}
}

export interface ChartDataPoint {
	date: string
	basic: number
	enhanced: number
}

export interface MonthlyChartData {
	month: string
	basic: number
	enhanced: number
}

// API response types
export interface KycApiResponse {
	data: KycRecord[]
	total: number
	page: number
	limit: number
}

export interface KycReviewApiResponse {
	data: KycReview[]
	total: number
}

// Form state types
export interface KycFormData {
	user_id: string
	status: KycRecord['status']
	verification_level: KycRecord['verification_level']
}

export interface ReviewFormData {
	decision: KycReview['decision']
	review_notes: string
	additional_notes?: string
}
