-- ============================================================================
-- COMMUNITY FUND GOVERNANCE
-- ============================================================================

-- Governance round status enum
CREATE TYPE governance_round_status AS ENUM ('upcoming', 'active', 'ended');

-- ============================================================================
-- GOVERNANCE ROUNDS
-- ============================================================================

CREATE TABLE governance_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status governance_round_status NOT NULL DEFAULT 'upcoming',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_fund_amount NUMERIC(20, 7) NOT NULL DEFAULT 0,
  fund_currency TEXT NOT NULL DEFAULT 'XLM',
  winner_option_id UUID,
  -- On-chain round ID assigned by the Governance Soroban contract
  contract_round_id INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- GOVERNANCE OPTIONS (campaigns / projects eligible for fund redistribution)
-- ============================================================================

CREATE TABLE governance_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES governance_rounds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_slug TEXT,
  image_url TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  total_weight INTEGER NOT NULL DEFAULT 0,
  -- On-chain option ID assigned by the Governance Soroban contract
  contract_option_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add FK for winner after options table exists
ALTER TABLE governance_rounds
  ADD CONSTRAINT fk_winner_option
  FOREIGN KEY (winner_option_id) REFERENCES governance_options(id) ON DELETE SET NULL;

-- ============================================================================
-- GOVERNANCE VOTES
-- ============================================================================

CREATE TABLE governance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES governance_rounds(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES governance_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  vote_weight INTEGER NOT NULL DEFAULT 1,
  nft_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (nft_tier IN ('bronze', 'silver', 'gold', 'diamond')),
  stellar_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(round_id, user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_governance_rounds_status ON governance_rounds(status);
CREATE INDEX idx_governance_rounds_starts_at ON governance_rounds(starts_at);
CREATE INDEX idx_governance_rounds_ends_at ON governance_rounds(ends_at);
CREATE INDEX idx_governance_options_round_id ON governance_options(round_id);
CREATE INDEX idx_governance_votes_round_id ON governance_votes(round_id);
CREATE INDEX idx_governance_votes_option_id ON governance_votes(option_id);
CREATE INDEX idx_governance_votes_user_id ON governance_votes(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE governance_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

-- Governance rounds: public read, admin write
CREATE POLICY "Public can read governance rounds"
  ON governance_rounds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage governance rounds"
  ON governance_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Governance options: public read, admin write
CREATE POLICY "Public can read governance options"
  ON governance_options FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage governance options"
  ON governance_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Governance votes: authenticated users can read all, write own
CREATE POLICY "Authenticated users can read governance votes"
  ON governance_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can cast their own vote"
  ON governance_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages votes"
  ON governance_votes FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_governance_rounds_updated_at
  BEFORE UPDATE ON governance_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_governance_options_updated_at
  BEFORE UPDATE ON governance_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: auto-close rounds past their end date
-- ============================================================================

CREATE OR REPLACE FUNCTION close_expired_governance_rounds()
RETURNS void AS $$
DECLARE
  round_rec RECORD;
  top_option RECORD;
BEGIN
  FOR round_rec IN
    SELECT id FROM governance_rounds
    WHERE status = 'active' AND ends_at < NOW()
  LOOP
    -- Find the winning option (highest total_weight of upvotes)
    SELECT go.id INTO top_option
    FROM governance_options go
    JOIN governance_votes gv ON gv.option_id = go.id
    WHERE go.round_id = round_rec.id AND gv.vote_type = 'up'
    GROUP BY go.id
    ORDER BY SUM(gv.vote_weight) DESC
    LIMIT 1;

    UPDATE governance_rounds
    SET status = 'ended',
        winner_option_id = top_option.id,
        updated_at = NOW()
    WHERE id = round_rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: activate upcoming rounds whose start time has passed
-- ============================================================================

CREATE OR REPLACE FUNCTION activate_governance_rounds()
RETURNS void AS $$
BEGIN
  UPDATE governance_rounds
  SET status = 'active', updated_at = NOW()
  WHERE status = 'upcoming' AND starts_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: increment a vote count field on governance_options
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_governance_option_count(
  p_option_id UUID,
  p_field TEXT,
  p_weight INTEGER
)
RETURNS void AS $$
BEGIN
  IF p_field = 'upvotes' THEN
    UPDATE governance_options
    SET upvotes = upvotes + p_weight,
        total_weight = total_weight + p_weight,
        updated_at = NOW()
    WHERE id = p_option_id;
  ELSIF p_field = 'downvotes' THEN
    UPDATE governance_options
    SET downvotes = downvotes + p_weight,
        updated_at = NOW()
    WHERE id = p_option_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
