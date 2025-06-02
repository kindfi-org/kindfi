import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../types/supabase'

export function useSupabase() {
	const supabase = createClientComponentClient<Database>()
	return { supabase }
}
