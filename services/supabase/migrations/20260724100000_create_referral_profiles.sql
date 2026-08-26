-- Referral profiles: stores activated referrer codes for lookup and sharing
CREATE TABLE referral_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  stellar_address TEXT,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  on_chain_ready BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referral_profiles_referral_code ON referral_profiles(referral_code);

ALTER TABLE referral_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral profile"
  ON referral_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage referral profiles"
  ON referral_profiles FOR ALL
  TO service_role
  USING (true);
