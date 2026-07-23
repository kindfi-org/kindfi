import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeFoundationManage } from '~/lib/api/authorize-foundation-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	foundationFounderUpdateSchema,
	foundationSlugParamSchema,
} from '~/lib/schemas/foundation.schemas'
import { validateRequest } from '~/lib/utils/validation'

/**
 * PATCH /api/foundations/[slug]/founder
 * Replace the foundation founder with a registered user.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await params
		const slugValidation = validateRequest(foundationSlugParamSchema, { slug })
		if (!slugValidation.success) return slugValidation.response

		const body = await req.json()
		const validation = validateRequest(foundationFounderUpdateSchema, body)
		if (!validation.success) return validation.response
		const { userId: newFounderId } = validation.data

		const { data: foundation, error: foundationError } = await supabaseServiceRole
			.from('foundations')
			.select('id, founder_id')
			.eq('slug', slugValidation.data.slug)
			.single()

		if (foundationError || !foundation) {
			return NextResponse.json({ error: 'Foundation not found' }, { status: 404 })
		}

		const auth = await authorizeFoundationManage(userId, foundation.id)
		if (!auth.ok) {
			return NextResponse.json({ error: 'Forbidden' }, { status: auth.status })
		}

		if (foundation.founder_id === newFounderId) {
			return NextResponse.json({ error: 'This user is already the founder' }, { status: 400 })
		}

		const { data: newFounderProfile, error: profileError } = await supabaseServiceRole
			.from('profiles')
			.select('id, display_name, slug, image_url, bio')
			.eq('id', newFounderId)
			.maybeSingle()

		if (profileError || !newFounderProfile) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const { error: updateError } = await supabaseServiceRole
			.from('foundations')
			.update({
				founder_id: newFounderId,
				updated_at: new Date().toISOString(),
			})
			.eq('id', foundation.id)

		if (updateError) {
			logger.error('Founder update error:', updateError)
			return NextResponse.json({ error: 'Failed to update founder' }, { status: 500 })
		}

		// Remove the new founder from the public team list if they were already a member
		await supabaseServiceRole
			.from('foundation_team')
			.delete()
			.eq('foundation_id', foundation.id)
			.eq('user_id', newFounderId)

		// Remove redundant manage-access row; founder access is via founder_id
		await supabaseServiceRole
			.from('foundation_members')
			.delete()
			.eq('foundation_id', foundation.id)
			.eq('user_id', newFounderId)

		return NextResponse.json({
			message: 'Founder updated successfully',
			founder: {
				id: newFounderProfile.id,
				displayName: newFounderProfile.display_name,
				slug: newFounderProfile.slug,
				imageUrl: newFounderProfile.image_url,
				bio: newFounderProfile.bio,
			},
		})
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
