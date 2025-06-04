import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMemo } from 'react'
import type { Database } from '../types/supabase'

export function useSupabase() {
	const supabase = useMemo(() => createClientComponentClient<Database>(), [])
	return { supabase }
}
