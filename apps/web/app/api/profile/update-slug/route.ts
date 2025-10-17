'use server'

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const slug = (body?.slug as string | undefined)?.trim().toLowerCase()
        if (!slug || !/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(slug)) {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
        }

        // Ensure uniqueness
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (existing && existing.id !== user.id) {
            return NextResponse.json({ error: 'Handle already taken' }, { status: 409 })
        }

        const { error } = await supabase
            .from('profiles')
            .update({ slug })
            .eq('id', user.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, slug })
    } catch (e) {
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
    }
}


