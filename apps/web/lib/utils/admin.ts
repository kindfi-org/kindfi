import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

export async function requireAdmin() {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user) {
		redirect('/sign-in?callbackUrl=/admin')
	}

	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		console.error('Error fetching user profile:', error)
		redirect('/sign-in')
	}

	if (profileData.role !== 'admin') {
		redirect('/')
	}

	return { session, userId: session.user.id }
}

export function isAdminRole(role: string | null | undefined): boolean {
	return role === 'admin'
}
