import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeProjectManage, getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { projectUpdateCreateSchema } from '~/lib/schemas/project.schemas'
import { deriveProjectUpdateTitle } from '~/lib/utils/project-update-title'
import { validateRequest } from '~/lib/utils/validation'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const [session, { slug }, body] = await Promise.all([
			getServerSession(nextAuthOption),
			params,
			req.json(),
		])
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const projectIdFromSlug = await getProjectIdBySlug(slug)
		if (!projectIdFromSlug) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const validation = validateRequest(projectUpdateCreateSchema, body)
		if (!validation.success) return validation.response

		const { projectId, title, content } = validation.data
		if (projectId !== projectIdFromSlug) {
			return NextResponse.json({ error: 'Project mismatch' }, { status: 400 })
		}

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json(
				{ error: auth.status === 404 ? 'Project not found' : 'Forbidden' },
				{ status: auth.status },
			)
		}

		const { data, error } = await supabaseServiceRole
			.from('project_updates')
			.insert({
				project_id: projectId,
				author_id: userId,
				title: deriveProjectUpdateTitle(content, title),
				content,
			})
			.select('id, title, content, created_at, updated_at, author_id, project_id')
			.single()

		if (error) {
			logger.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ data })
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
