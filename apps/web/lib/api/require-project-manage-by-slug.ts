import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authorizeProjectManage, getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'

type ProjectManageAuthSuccess = {
	client: TypedSupabaseClient
	projectId: string
	slug: string
	userId: string
}

type ProjectManageAuthFailure = {
	response: NextResponse
}

export async function requireProjectManageBySlug(
	slug: string,
): Promise<ProjectManageAuthSuccess | ProjectManageAuthFailure> {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user?.id) {
		return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
	}

	const projectId = await getProjectIdBySlug(slug)
	if (!projectId) {
		return { response: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
	}

	const auth = await authorizeProjectManage(session.user.id, projectId)
	if (!auth.ok) {
		return {
			response: NextResponse.json(
				{ error: auth.status === 404 ? 'Not found' : 'Forbidden' },
				{ status: auth.status },
			),
		}
	}

	return {
		client: supabaseServiceRole,
		projectId,
		slug,
		userId: session.user.id,
	}
}
