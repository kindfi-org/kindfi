import { RightPanel } from '~/components/sections/user/right-panel'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let initialMode: 'user' | 'creator' = 'user'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'kindler') initialMode = 'creator'
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col-reverse md:flex-row">
                <main className="flex-1 w-full md:w-[calc(100%-340px)]">{children}</main>
                <aside className="w-full md:w-[340px] md:flex-shrink-0">
                    <div className="h-full sticky top-0">
                        <RightPanel initialMode={initialMode} />
                    </div>
                </aside>
            </div>
        </div>
    )
}


