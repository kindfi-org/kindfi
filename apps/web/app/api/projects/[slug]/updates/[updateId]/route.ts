import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeProjectManage, getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { projectUpdateDeleteSchema, projectUpdatePatchSchema } from '~/lib/schemas/project.schemas'
import { deriveProjectUpdateTitle } from '~/lib/utils/project-update-title'
import { validateRequest } from '~/lib/utils/validation'

async function getUpdateForProject(updateId: string, projectId: string) {
	const { data, error } = await supabaseServiceRole
		.from('project_updates')
		.select('id, author_id, project_id, content, title')
		.eq('id', updateId)
		.eq('project_id', projectId)
		.maybeSingle()

	if (error) throw error
	return data
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ slug: string; updateId: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug, updateId } = await params
		const projectIdFromSlug = await getProjectIdBySlug(slug)
		if (!projectIdFromSlug) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const body = await req.json()
		const validation = validateRequest(projectUpdatePatchSchema, body)
		if (!validation.success) return validation.response

		const { projectId, title, content } = validation.data
		if (projectId !== projectIdFromSlug) {
			return NextResponse.json({ error: 'Project mismatch' }, { status: 400 })
		}

		if (!content && title === undefined) {
			return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
		}

		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json(
				{ error: auth.status === 404 ? 'Project not found' : 'Forbidden' },
				{ status: auth.status },
			)
		}

		const existing = await getUpdateForProject(updateId, projectId)
		if (!existing) {
			return NextResponse.json({ error: 'Update not found' }, { status: 404 })
		}

		const canEdit =
			existing.author_id === userId || auth.access.isOwner || auth.access.isPlatformAdmin
		if (!canEdit) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const nextContent = content ?? existing.content
		const nextTitle = deriveProjectUpdateTitle(nextContent, title ?? existing.title)

		const { data, error } = await supabaseServiceRole
			.from('project_updates')
			.update({
				content: nextContent,
				title: nextTitle,
				updated_at: new Date().toISOString(),
			})
			.eq('id', updateId)
			.eq('project_id', projectId)
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

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ slug: string; updateId: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug, updateId } = await params
		const projectIdFromSlug = await getProjectIdBySlug(slug)
		if (!projectIdFromSlug) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const body = await req.json()
		const validation = validateRequest(projectUpdateDeleteSchema, body)
		if (!validation.success) return validation.response

		const { projectId } = validation.data
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

		const existing = await getUpdateForProject(updateId, projectId)
		if (!existing) {
			return NextResponse.json({ error: 'Update not found' }, { status: 404 })
		}

		const canDelete =
			existing.author_id === userId || auth.access.isOwner || auth.access.isPlatformAdmin
		if (!canDelete) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { error } = await supabaseServiceRole
			.from('project_updates')
			.delete()
			.eq('id', updateId)
			.eq('project_id', projectId)

		if (error) {
			logger.error(error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ message: 'Update deleted' })
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
