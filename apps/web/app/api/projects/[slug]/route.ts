import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { resolveProjectBySlug } from '~/lib/queries/projects/resolve-project-by-slug'

/**
 * GET /api/projects/[slug]
 * Project detail for the public page, including development-only rows for authorized viewers.
 */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await context.params
		const session = await getServerSession(nextAuthOption)
		const project = await resolveProjectBySlug(slug, session?.user?.id)

		if (!project) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		return NextResponse.json(project)
	} catch (error) {
		logger.error('[Project detail API] Failed to load project:', error)
		return NextResponse.json({ error: 'Failed to load project' }, { status: 500 })
	}
}
