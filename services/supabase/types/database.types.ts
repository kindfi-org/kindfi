export type KycStatus = 'pending' | 'approved' | 'rejected' | 'verified';
export type VerificationLevel = 'basic' | 'enhanced';

/**
 * Represents an ISO 8601 timestamp string, e.g. "2024-05-24T12:34:56.789Z".
 */
export type IsoTimestamp = string;

export interface KycReview {
  id: string;
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id: string | null;
  notes: string | null;
  /**
   * ISO 8601 timestamp string, e.g. "2024-05-24T12:34:56.789Z"
   */
  created_at: IsoTimestamp;
  /**
   * ISO 8601 timestamp string, e.g. "2024-05-24T12:34:56.789Z"
   */
  updated_at: IsoTimestamp;
}

/**
 * CreateKycReview is used for inserting new KYC reviews.
 * - Optional fields (`?`): The field may be omitted entirely from the object.
 * - Nullable fields (`| null`): The field can be provided with a value or explicitly set to null.
 * 
 * For create operations, we use optional fields to allow omitting them.
 * If provided, they can be set to a string or null.
 */
export interface CreateKycReview {
  user_id: string;
  status: KycStatus;
  verification_level: VerificationLevel;
  reviewer_id?: string | null; // Optional and nullable: can be omitted or set to null
  notes?: string | null;       // Optional and nullable: can be omitted or set to null
}

/**
 * UpdateKycReview is used for updating existing KYC reviews.
 * - All fields are optional to allow partial updates.
 * - Fields can be set to a value or explicitly set to null.
 */
export interface UpdateKycReview {
  status?: KycStatus;
  verification_level?: VerificationLevel;
  reviewer_id?: string | null; // Optional and nullable
  notes?: string | null;       // Optional and nullable
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