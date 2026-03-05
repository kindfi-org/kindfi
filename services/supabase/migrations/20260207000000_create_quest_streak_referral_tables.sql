-- Create quest types enum
CREATE TYPE quest_type AS ENUM (
  'multi_region_donation',
  'weekly_streak',
  'multi_category_donation',
  'referral_quest',
  'total_donation_amount',
  'quest_master'
);

-- Create quest status enum
CREATE TYPE quest_status AS ENUM (
  'active',
  'completed',
  'expired'
);

-- Create streak period enum
CREATE TYPE streak_period AS ENUM (
  'weekly',
  'monthly'
);

-- Create referral status enum
CREATE TYPE referral_status AS ENUM (
  'pending',
  'onboarded',
  'first_donation',
  'active'
);

-- ============================================================================
-- QUESTS TABLES
-- ============================================================================

-- Quest definitions table
CREATE TABLE quest_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id INTEGER NOT NULL UNIQUE,
  quest_type quest_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  reward_points INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User quest progress table
CREATE TABLE user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id INTEGER NOT NULL REFERENCES quest_definitions(quest_id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, quest_id)
);

-- ============================================================================
-- STREAKS TABLES
-- ============================================================================

-- User streaks table
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period streak_period NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_donation_timestamp TIMESTAMP WITH TIME ZONE,
  contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(user_id, period)
);

-- ============================================================================
-- REFERRALS TABLES
-- ============================================================================

-- Referral records table
CREATE TABLE referral_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status referral_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  onboarded_at TIMESTAMP WITH TIME ZONE,
  first_donation_at TIMESTAMP WITH TIME ZONE,
  total_donations INTEGER NOT NULL DEFAULT 0,
  contract_address TEXT,
  UNIQUE(referred_id)
);

-- Referrer statistics table
CREATE TABLE referrer_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  active_referrals INTEGER NOT NULL DEFAULT 0,
  total_reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(referrer_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Quest indexes
CREATE INDEX idx_quest_definitions_quest_type ON quest_definitions(quest_type);
CREATE INDEX idx_quest_definitions_is_active ON quest_definitions(is_active);
CREATE INDEX idx_user_quest_progress_user_id ON user_quest_progress(user_id);
CREATE INDEX idx_user_quest_progress_quest_id ON user_quest_progress(quest_id);
CREATE INDEX idx_user_quest_progress_is_completed ON user_quest_progress(is_completed);

-- Streak indexes
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_period ON user_streaks(period);

-- Referral indexes
CREATE INDEX idx_referral_records_referrer_id ON referral_records(referrer_id);
CREATE INDEX idx_referral_records_referred_id ON referral_records(referred_id);
CREATE INDEX idx_referral_records_status ON referral_records(status);
CREATE INDEX idx_referrer_statistics_referrer_id ON referrer_statistics(referrer_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrer_statistics ENABLE ROW LEVEL SECURITY;

-- Quest definitions: Public read, admin write
CREATE POLICY "Public read access to quest definitions"
  ON quest_definitions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage quest definitions"
  ON quest_definitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User quest progress: Users can view their own progress
CREATE POLICY "Users can view their own quest progress"
  ON user_quest_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage quest progress"
  ON user_quest_progress FOR ALL
  TO service_role
  USING (true);

-- User streaks: Users can view their own streaks
CREATE POLICY "Users can view their own streaks"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage streaks"
  ON user_streaks FOR ALL
  TO service_role
  USING (true);

-- Referral records: Users can view their own referrals
CREATE POLICY "Users can view referrals where they are referrer or referred"
  ON referral_records FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service role can manage referral records"
  ON referral_records FOR ALL
  TO service_role
  USING (true);

-- Referrer statistics: Users can view their own statistics
CREATE POLICY "Users can view their own referrer statistics"
  ON referrer_statistics FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Service role can manage referrer statistics"
  ON referrer_statistics FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_quest_definitions_updated_at
  BEFORE UPDATE ON quest_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quest_progress_updated_at
  BEFORE UPDATE ON user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrer_statistics_updated_at
  BEFORE UPDATE ON referrer_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
