import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { uploadStoryImage } from '~/lib/utils/project-utils'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await params

		// Resolve project and verify user permissions
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('slug', slug)
			.single()

		if (projectError || !project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const isOwner = project.kindler_id === userId
		if (!isOwner) {
			const { data: memberData } = await supabaseServiceRole
				.from('project_members')
				.select('role')
				.eq('project_id', project.id)
				.eq('user_id', userId)
				.in('role', ['core', 'admin', 'editor'])
				.single()

			const { data: profile } = await supabaseServiceRole
				.from('profiles')
				.select('role')
				.eq('id', userId)
				.single()

			if (!memberData && profile?.role !== 'admin') {
				return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
			}
		}

		const formData = await req.formData()
		const file = formData.get('image')

		if (!(file instanceof File)) {
			return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
		}

		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
				{ status: 400 },
			)
		}

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json({ error: 'File too large. Maximum size is 5 MB' }, { status: 400 })
		}

		const url = await uploadStoryImage(slug, file, supabaseServiceRole)
		if (!url) {
			return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
		}

		return NextResponse.json({ url })
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
