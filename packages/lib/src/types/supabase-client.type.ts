import type { Database } from '@services/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export type TypedSupabaseClient = SupabaseClient<Database>
