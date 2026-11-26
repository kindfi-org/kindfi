/*
  migration: admin users overview view
  purpose:
    - Provide a single relation the admin user list can filter server-side:
      profile fields joined with each user's latest KYC review status
      (kyc_reviews.user_id is not unique, so "latest" needs SQL).
    - kyc_status is normalized: users with no review row read as
      'not_started'.
  safety:
    - security_invoker: the view runs with the caller's permissions, so the
      RLS policies of profiles and kyc_reviews still apply to non-service
      callers. It exposes no KYC notes or provider payloads — only the
      status, level, and review timestamp.
*/

CREATE OR REPLACE VIEW public.admin_users_overview
WITH (security_invoker = on) AS
SELECT
	p.id,
	p.display_name,
	p.email,
	p.image_url,
	p.slug,
	p.role,
	p.onboarding_provider,
	p.external_wallet_address,
	p.pollar_wallet_address,
	p.created_at,
	p.updated_at,
	COALESCE(k.status::text, 'not_started') AS kyc_status,
	k.verification_level::text AS kyc_verification_level,
	k.updated_at AS kyc_updated_at
FROM public.profiles p
LEFT JOIN LATERAL (
	SELECT kr.status, kr.verification_level, kr.updated_at
	FROM public.kyc_reviews kr
	WHERE kr.user_id = p.id
	ORDER BY kr.created_at DESC
	LIMIT 1
) k ON true;

COMMENT ON VIEW public.admin_users_overview IS
	'Profiles joined with the latest KYC review status. Backs the admin user list; no sensitive KYC payloads.';
