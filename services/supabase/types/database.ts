// --- KYC Review Common Types ---
type KycReviewStatus = 'pending' | 'approved' | 'rejected' | 'verified';
type KycVerificationLevel = 'basic' | 'enhanced';

interface KycReviewBase {
  user_id: string;
  status: KycReviewStatus;
  verification_level: KycVerificationLevel;
  reviewer_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type KycReviewInsert = Partial<Pick<KycReviewRow, 'id' | 'status' | 'verification_level' | 'reviewer_id' | 'notes' | 'created_at' | 'updated_at'>> & Pick<KycReviewRow, 'user_id'>;
type KycReviewUpdate = Partial<KycReviewRow>;

interface KycReviewRow extends KycReviewBase {
  id: string;
}

// Add to existing Database interface
export interface Database {
  public: {
    Tables: {
      // ... existing tables
      kyc_reviews: {
        Row: KycReviewRow;
        Insert: KycReviewInsert;
        Update: KycReviewUpdate;
      };
    };
    // ... rest of the interface
  };
}