// Add to existing Database interface
export interface Database {
  public: {
    Tables: {
      // ... existing tables
      kyc_reviews: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'verified';
          verification_level: 'basic' | 'enhanced';
          reviewer_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'verified';
          verification_level?: 'basic' | 'enhanced';
          reviewer_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'verified';
          verification_level?: 'basic' | 'enhanced';
          reviewer_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    // ... rest of the interface
  };
}