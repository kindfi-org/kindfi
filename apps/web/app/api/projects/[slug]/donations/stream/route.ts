import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { getProjectDonationStream } from '~/lib/queries/projects/get-project-donation-stream'
import { validateProjectSlug } from '~/lib/validation/project-slug'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await params

		if (!validateProjectSlug(slug)) {
			return NextResponse.json({ error: 'Invalid project slug' }, { status: 400 })
		}

		const projectId = await getProjectIdBySlug(slug)
		if (!projectId) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const url = new URL(req.url)
		const limitParam = Number(url.searchParams.get('limit') ?? 15)
		const limit = Number.isFinite(limitParam) ? limitParam : 15

		const data = await getProjectDonationStream(supabaseServiceRole, projectId, limit)

		return NextResponse.json({ data })
	} catch (error) {
		logger.error('GET /api/projects/[slug]/donations/stream error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
