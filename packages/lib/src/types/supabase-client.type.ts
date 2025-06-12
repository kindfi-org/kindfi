import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/client/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>
