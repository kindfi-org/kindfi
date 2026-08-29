import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

/**
 * The `kyc` Postgres schema is not in generated Supabase types until
 * `task supabase:gen` runs against a live database. This helper is the
 * single server-only access point for that schema.
 *
 * Backed by the service-role client. Callers must authenticate first.
 */
export const getKycSchemaClient = (): SupabaseClient => supabaseServiceRole.schema('kyc')
