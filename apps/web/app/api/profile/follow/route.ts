'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const supabase = await createSupabaseServerClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const { targetUserId, action } = await request.json()
	if (!targetUserId || !['follow', 'unfollow'].includes(action)) {
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
	}

	if (action === 'follow') {
		const { error } = await supabase
			.from('user_follows')
			.insert({ follower_id: user.id, following_id: targetUserId })
		if (error)
			return NextResponse.json({ error: error.message }, { status: 400 })
		return NextResponse.json({ success: true })
	}

	const { error } = await supabase
		.from('user_follows')
		.delete()
		.eq('follower_id', user.id)
		.eq('following_id', targetUserId)
	if (error) return NextResponse.json({ error: error.message }, { status: 400 })
	return NextResponse.json({ success: true })
}
