import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { ReactNode } from 'react'
import { ProjectManageCommandCenter } from '~/components/sections/projects/manage/project-manage-command-center'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { canUserManageProject } from '~/lib/queries/projects/can-user-manage-project'
import { getProjectManageMeta } from '~/lib/queries/projects/get-project-manage-meta'

export default async function ManageLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const [session, supabase] = await Promise.all([
		getServerSession(nextAuthOption),
		createSupabaseServerClient(),
	])

	const projectMeta = await getProjectManageMeta(supabase, slug)
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
