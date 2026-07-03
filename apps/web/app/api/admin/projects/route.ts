import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { isPlatformAdmin } from '~/lib/queries/projects/development-only-access'
import { getAllProjects } from '~/lib/queries/projects/get-all-projects'

export async function GET() {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user?.id || !(await isPlatformAdmin(session.user.id))) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
	}

	const projects = await getAllProjects(supabaseServiceRole, [], 'most-recent', 1000)

	return NextResponse.json(projects)
}
