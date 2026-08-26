import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getAdminReviewQueue } from '~/lib/queries/milestone-reviews/get-admin-review-queue'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'
import { adminMilestoneReviewListQuerySchema } from '~/lib/validators/milestone-review-request'

export async function GET(request: Request) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id || !(await isPlatformAdmin(session.user.id))) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const parsed = adminMilestoneReviewListQuerySchema.safeParse({
			status: searchParams.get('status') ?? 'pending',
		})

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
		}

		const requests = await getAdminReviewQueue(supabaseServiceRole, parsed.data.status)
		return NextResponse.json({ requests })
	} catch (error) {
		logger.error(error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
