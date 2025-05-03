CREATE TABLE IF NOT EXISTS kyc_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_kyc_status_user_id ON kyc_status(user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_kyc_status_updated_at
  BEFORE UPDATE ON kyc_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 