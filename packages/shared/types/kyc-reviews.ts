// KYC Review Types
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'verified';
export type VerificationLevel = 'basic' | 'enhanced';

export interface KycReview {
  id: string;
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKycReviewInput {
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id?: string;
  notes?: string;
}

export interface UpdateKycReviewInput {
  status?: KycStatus;
  verification_level?: VerificationLevel;
  reviewer_id?: string;
  notes?: string;
}