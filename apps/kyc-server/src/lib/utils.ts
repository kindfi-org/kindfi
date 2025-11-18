import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
	KycDetailsFormData,
	KycRecord,
	KycRecordApi,
	UserDetails,
} from '~/lib/types/dashboard'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Mapping function to convert API response to domain type
export function mapKycRecordApiToDomain(apiRecord: KycRecordApi): KycRecord {
	return {
		id: apiRecord.kyc_id || apiRecord.id,
		userId: apiRecord.user_id,
		email: apiRecord.email || '',
		displayName: apiRecord.display_name || '',
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

// Convert UserDetails from API to KycDetailsFormData for form components
export function mapUserDetailsToFormData(
	userDetails: UserDetails,
): KycDetailsFormData {
	return {
		userId: userDetails.profile.id,
		email: userDetails.profile.email,
		displayName: userDetails.profile.displayName,
		status: userDetails.kyc?.status || 'pending',
		verificationLevel: userDetails.kyc?.verificationLevel || 'basic',
		notes: userDetails.kyc?.notes || null,
		createdAt: userDetails.kyc?.createdAt || userDetails.profile.createdAt,
		updatedAt: userDetails.kyc?.updatedAt || userDetails.profile.updatedAt,
		kycId: userDetails.kyc?.id,
		// Additional user information
		bio: userDetails.profile.bio,
		imageUrl: userDetails.profile.imageUrl,
		role: userDetails.profile.role,
		// Devices information
		devices: userDetails.devices,
		// Documents information
		documents: userDetails.documents,
		// Verification status
		verification: userDetails.verification,
	}
}
