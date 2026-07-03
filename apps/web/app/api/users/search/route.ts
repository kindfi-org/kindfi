import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { userSearchQuerySchema } from '~/lib/schemas/user.schemas'
import { validateRequest } from '~/lib/utils/validation'

const escapeFilterValue = (value: string): string =>
	value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

export async function GET(req: Request) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const validation = validateRequest(userSearchQuerySchema, {
			q: searchParams.get('q'),
		})
		if (!validation.success) return validation.response

		const { q } = validation.data
		const pattern = `%${escapeFilterValue(q)}%`

		const { data: users, error } = await supabaseServiceRole
			.from('profiles')
			.select('id, display_name, email, image_url, slug')
			.or(`display_name.ilike."${pattern}",email.ilike."${pattern}",slug.ilike."${pattern}"`)
			.order('display_name', { ascending: true, nullsFirst: false })
			.limit(10)

		if (error) {
			logger.error('User search error:', error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({
			users:
				users?.map((user) => ({
					id: user.id,
					displayName: user.display_name,
					email: user.email,
					imageUrl: user.image_url,
					slug: user.slug,
				})) ?? [],
		})
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
