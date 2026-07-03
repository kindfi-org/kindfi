import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { ReactNode } from 'react'
import { ProjectManageCommandCenter } from '~/components/sections/projects/manage/project-manage-command-center'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { canUserManageProject } from '~/lib/queries/projects/can-user-manage-project'
import { getProjectManageMeta } from '~/lib/queries/projects/get-project-manage-meta'
import { getAuthenticatedSupabaseServerClient } from '~/lib/supabase/authenticated-server-client'

async function resolveProjectManageMeta(slug: string) {
	const authenticatedClient = await getAuthenticatedSupabaseServerClient()
	const authenticatedMeta = await getProjectManageMeta(authenticatedClient, slug)
	if (authenticatedMeta) {
		return authenticatedMeta
	}

	// Fallback for development-only projects when Supabase JWT is unavailable.
	return getProjectManageMeta(supabaseServiceRole, slug)
}

export default async function ManageLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const session = await getServerSession(nextAuthOption)

	const projectMeta = await resolveProjectManageMeta(slug)
	if (!projectMeta) {
		notFound()
	}

	const canManage = await canUserManageProject(
		projectMeta.id,
		projectMeta.kindlerId,
		session?.user?.id,
	)

	if (!canManage) {
		redirect(`/projects/${slug}`)
	}

	return (
		<section
			className="container mx-auto max-w-6xl px-4 py-6 md:py-8"
			aria-label="Project management"
		>
			<ProjectManageCommandCenter slug={slug} project={projectMeta} />
			<main className="min-w-0 pt-6">{children}</main>
		</section>
	)
}
