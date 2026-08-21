import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

/**
 * The `compliance` Postgres schema is not part of the generated Supabase
 * types (`@services/supabase`) — it is new in this change and the types
 * would need `task supabase:gen` against a live database to regenerate.
 * This helper narrows the untyped `.schema('compliance')` client to a single
 * place so callers get consistent, server-only access instead of scattering
 * `as unknown as ...` casts across the compliance service modules.
 *
 * Server-only: backed by the service-role client. Every caller is
 * responsible for its own authorization check before calling this.
 */
export function getComplianceSchemaClient() {
	return supabaseServiceRole.schema('compliance')
}
