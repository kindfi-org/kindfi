import type { Database } from '@services/supabase/src/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type TypedSupabaseClient = SupabaseClient<Database>
