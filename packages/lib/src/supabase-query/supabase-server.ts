import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// lib/supabase-server.ts (for server-side Supabase in Next.js)
import { cookies } from 'next/headers'

export function getServerSupabaseClient() {
	return createServerComponentClient({
		cookies,
	})
}
