import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { followActionSchema } from '~/lib/schemas/profile.schemas'
import { validateRequest } from '~/lib/utils/validation'

export async function GET(request: Request) {
	const session = await getServerSession(nextAuthOption)
	const userId = session?.user?.id
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const targetUserId = searchParams.get('targetUserId')
	if (!targetUserId) {
		return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })
	}

	const { data, error } = await supabaseServiceRole
		.from('user_follows')
		.select('follower_id')
		.eq('follower_id', userId)
		.eq('following_id', targetUserId)
		.maybeSingle()

	if (error) {
		logger.error('GET /api/profile/follow failed:', error)
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json({ isFollowing: Boolean(data) })
}

export async function POST(request: Request) {
	const session = await getServerSession(nextAuthOption)
	const userId = session?.user?.id
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await request.json()
	const validation = validateRequest(followActionSchema, body)
	if (!validation.success) {
		return validation.response
	}

	const { targetUserId, action } = validation.data

	if (targetUserId === userId) {
		return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
	}

	if (action === 'follow') {
		const { error } = await supabaseServiceRole
			.from('user_follows')
			.insert({ follower_id: userId, following_id: targetUserId })

		if (error) {
			if (error.code === '23505') {
				return NextResponse.json({ success: true, isFollowing: true })
			}
			logger.error('POST /api/profile/follow insert failed:', error)
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ success: true, isFollowing: true })
	}

	const { error } = await supabaseServiceRole
		.from('user_follows')
		.delete()
		.eq('follower_id', userId)
		.eq('following_id', targetUserId)

	if (error) {
		logger.error('POST /api/profile/follow delete failed:', error)
		return NextResponse.json({ error: error.message }, { status: 400 })
	}

	return NextResponse.json({ success: true, isFollowing: false })
}
