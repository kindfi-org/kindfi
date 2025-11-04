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

// API Response type - snake_case fields as returned by the backend
export interface KycRecordApi {
	id: string
	user_id: string
	status: 'pending' | 'approved' | 'rejected' | 'verified' | null
	verification_level: 'basic' | 'enhanced' | null
	reviewer_id?: string | null
	notes?: string | null
	created_at: string
	updated_at: string
	// KYC-specific timestamps (when user has KYC record)
	kyc_id?: string | null
	kyc_created_at?: string | null
	kyc_updated_at?: string | null
	// Profile data from join
	email?: string | null
	display_name?: string | null
	profile_image_url?: string | null
	profile_role?: string | null
	// Device count from aggregation
	device_count: number
}

// Domain/UI type - camelCase fields for frontend use
export interface KycRecord {
	id: string
	userId: string
	email?: string | null
	displayName?: string | null
	status: 'pending' | 'approved' | 'rejected' | 'verified' | null
	verificationLevel: 'basic' | 'enhanced' | null
	reviewerId?: string | null
	notes?: string | null
	createdAt: string
	updatedAt: string
	profileImageUrl?: string | null
	profileRole?: string | null
	deviceCount: number
}

// Mapping function to convert API response to domain type
export function mapKycRecordApiToDomain(apiRecord: KycRecordApi): KycRecord {
	return {
		id: apiRecord.kyc_id || apiRecord.id,
		userId: apiRecord.user_id,
		email: apiRecord.email,
		displayName: apiRecord.display_name,
		status: apiRecord.status || null,
		verificationLevel: apiRecord.verification_level || null,
		reviewerId: apiRecord.reviewer_id,
		notes: apiRecord.notes,
		createdAt: apiRecord.kyc_created_at || apiRecord.created_at,
		updatedAt: apiRecord.kyc_updated_at || apiRecord.updated_at,
		profileImageUrl: apiRecord.profile_image_url,
		profileRole: apiRecord.profile_role,
		deviceCount: apiRecord.device_count,
	}
}

export type KycStatsTrends = {
	currentCount: number
	delta: number
	direction: 'same' | 'up' | 'down'
	isPositive: boolean
	percentChange: number
	priorCount: number
}

export interface KycStats {
	totalUsers: number
	pending: number
	approved: number
	rejected: number
	trends: {
		totalUsers: KycStatsTrends
		pending: KycStatsTrends
		approved: KycStatsTrends
		rejected: KycStatsTrends
	}
}

export interface ChartDataPoint {
	date: string
	signups: number
	kycStarts: number
}

export interface MonthlyChartData {
	month: string
	signups: number
	kycStarts: number
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
