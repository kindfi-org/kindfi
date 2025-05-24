export type KycStatus = 'pending' | 'approved' | 'rejected' | 'verified';
export type VerificationLevel = 'basic' | 'enhanced';

export interface KycReview {
  id: string;
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKycReview {
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id?: string;
  notes?: string;
}

export interface UpdateKycReview {
  status?: KycStatus;
  verification_level?: VerificationLevel;
  reviewer_id?: string;
  notes?: string;
}

// Database schema extension
export interface Database {
  public: {
    Tables: {
      kyc_reviews: {
        Row: KycReview;
        Insert: CreateKycReview;
        Update: UpdateKycReview;
      };
      // ... other tables
    };
    Enums: {
      kyc_status: KycStatus;
      verification_level: VerificationLevel;
      // ... other enums
    };
  };
}