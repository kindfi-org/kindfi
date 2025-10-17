import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { ProfileDashboard } from '~/components/sections/profile/profile-dashboard'

export default async function ProfilePage() {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/(auth-pages)/sign-in')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name, bio, image_url')
        .eq('id', user.id)
        .single()

    return (
        <ProfileDashboard
            user={{
                id: user.id,
                email: user.email ?? '',
                created_at: user.created_at ?? '',
                profile,
            }}
        />
    )
}


