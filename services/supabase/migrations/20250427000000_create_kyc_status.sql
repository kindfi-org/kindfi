
CREATE TABLE IF NOT EXISTS public.kyc_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
    verification_level TEXT NOT NULL CHECK (verification_level IN ('basic', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kyc_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC status"
    ON public.kyc_status
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all KYC statuses"
    ON public.kyc_status
    USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_status;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.kyc_status
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 