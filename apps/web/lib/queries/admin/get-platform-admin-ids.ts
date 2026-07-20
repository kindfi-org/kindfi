import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

export async function getPlatformAdminIds(): Promise<string[]> {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('id')
		.eq('role', 'admin')

	if (error || !data) {
		return []
	}

	return data.map((row) => row.id)
}
