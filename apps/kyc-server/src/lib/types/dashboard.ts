import type {
	kycReviewsInsertSchema,
	kycReviewsRowSchema,
} from '@services/supabase'
import type { LucideIcon } from 'lucide-react'
import type { z } from 'zod'
import type { statusEnum, verificationEnum } from '../schemas/kyc'

export type MetricKey = keyof Omit<KycStats, 'trends'>

export interface MetricConfig {
	key: MetricKey
	title: string
	iconColor: string
	icon: LucideIcon
	text: string
	description: string
}

export type TimeRange = '7d' | '30d' | '90d'

export type TimeRangeOption = {
	label: string
	value: TimeRange
}

export type KycReview = z.infer<typeof kycReviewsRowSchema>
export type KycReviewsInsertValues = z.infer<typeof kycReviewsInsertSchema>

// KYC Record type - represents the data structure for KYC records in the table
export interface KycRecord {
	id: string
	user_id: string
	email?: string | null
	display_name?: string | null
	status: 'pending' | 'approved' | 'rejected' | 'verified'
	verification_level: 'basic' | 'enhanced'
	reviewer_id?: string | null
	notes?: string | null
	created_at: string
	updated_at: string
}

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
	data: Record<string, unknown>
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
	status: typeof statusEnum
	verification_level: typeof verificationEnum
}

export interface ReviewFormData {
	decision: string
	review_notes: string
	additional_notes?: string
}
