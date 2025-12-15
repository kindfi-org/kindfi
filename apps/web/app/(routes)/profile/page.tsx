import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { or } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { ProfileDashboard } from '~/components/sections/profile/profile-dashboard'
import { nextAuthOption } from '~/lib/auth/auth-options'

export default async function ProfilePage() {
	const session = await getServerSession(nextAuthOption)
	console.log('📝 ProfilePage session:', session)
	if (!session?.user) {
		redirect('/sign-in')
	}

	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role, display_name, bio, image_url, slug, created_at')
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		console.error('⚠️ ProfilePage profile fetch error:', error)
		console.log('📝 ProfilePage profile data:', profileData)
		redirect('/sign-in')
	}

	return (
		<ProfileDashboard
			user={{
				id: session.user.id,
				email: session.user.email || '',
				created_at: profileData.created_at,
				profile: profileData,
			}}
		/>
	)
}
