import type { kycReviews } from '@packages/drizzle'
import type { kycReviewsInsertSchema } from '@services/supabase'
import type { LucideIcon } from 'lucide-react'
import type { KycStatusType, KycVerificationType } from './kyc-enums'

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

export type KycReview = typeof kycReviews.$inferSelect
export type KycReviewsInsertValues = typeof kycReviewsInsertSchema._input

// API Response type - snake_case fields as returned by the backend
export interface KycRecordApi {
	id: string
	kyc_id: string | null
	user_id: string
	status: KycStatusType | null
	verification_level: KycVerificationType | null
	reviewer_id?: string | null
	notes?: string | null
	created_at: string
	updated_at: string
	// KYC-specific timestamps (when user has KYC record)
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
	email: string
	displayName: string
	status: KycStatusType | null
	verificationLevel: KycVerificationType | null
	reviewerId?: string | null
	notes?: string | null
	createdAt: string
	updatedAt: string
	profileImageUrl?: string | null
	profileRole?: string | null
	deviceCount: number
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

// User Details API Response - matches /api/users/:id/status response structure
export interface UserDetails {
	profile: {
		id: string
		email: string | null
		displayName: string | null
		bio: string | null
		imageUrl: string | null
		role: 'kinder' | 'kindler'
		slug: string | null
		createdAt: string
		updatedAt: string
	}
	kyc: {
		id: string
		status: KycStatusType
		verificationLevel: KycVerificationType
		reviewerId: string | null
		notes: string | null
		createdAt: string
		updatedAt: string
	} | null
	devices: {
		count: number
		devices: Array<{
			id: string
			deviceName: string | null
			deviceType: 'single_device' | 'multi_device'
			credentialType: 'public-key'
			backupState: 'not_backed_up' | 'backed_up'
			createdAt: string
			lastUsedAt: string | null
			publicKey: string
			address: string
		}>
	}
	documents: {
		hasDocuments: boolean
		documentCount: number
		documents: Array<{
			name: string
			size: number
			updatedAt: string
		}>
	}
	verification: {
		hasProfile: boolean
		hasKycRecord: boolean
		hasDocuments: boolean
		isComplete: boolean
	}
}

// Helper type for KYC details in forms - extracted from UserDetails
export interface KycDetailsFormData {
	userId: string
	email: string | null
	displayName: string | null
	status: KycStatusType
	verificationLevel: KycVerificationType
	notes: string | null
	createdAt: string
	updatedAt: string
	kycId?: string
	// Additional user information
	bio: string | null
	imageUrl: string | null
	role: 'kinder' | 'kindler'
	// Devices information
	devices: {
		count: number
		devices: Array<{
			id: string
			deviceName: string | null
			deviceType: 'single_device' | 'multi_device'
			credentialType: 'public-key'
			backupState: 'not_backed_up' | 'backed_up'
			createdAt: string
			lastUsedAt: string | null
			publicKey: string
			address: string
		}>
	}
	// Documents information
	documents: {
		hasDocuments: boolean
		documentCount: number
		documents: Array<{
			name: string
			size: number
			updatedAt: string
		}>
	}
	// Verification status
	verification: {
		hasProfile: boolean
		hasKycRecord: boolean
		hasDocuments: boolean
		isComplete: boolean
	}
}

// Form state types
export interface KycFormData {
	user_id: string
	status: KycStatusType
	verification_level: KycVerificationType
}

export interface ReviewFormData {
	decision: string
	review_notes: string
	additional_notes?: string
}
