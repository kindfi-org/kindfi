-- Add index to escrow_participants table to speed up lookups by escrow_id and participant_address

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_escrow_participants_escrow_participant
  ON escrow_participants(escrow_id, participant_address);
