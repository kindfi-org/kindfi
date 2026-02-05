'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoSettingsOutline } from 'react-icons/io5'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { BreadcrumbSkeleton } from '../../detail/skeletons'
import { EscrowAdminPanel } from './escrow-admin-panel'

export function EscrowAdminClientWrapper({
	projectSlug,
}: {
	projectSlug: string
}) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: project,
		error,
		isLoading,
	} = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	const category = project.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
				className="relative z-10"
			>
				{/* Header */}
				<motion.header
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.1,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
					className="flex flex-col mb-8"
				>
					<div className="flex items-center gap-3 mt-4">
						<div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white shadow-sm">
							<IoSettingsOutline size={24} className="relative z-10" />
						</div>
						<div>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
								Escrow Creation
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mt-2 text-center">
								Initialize and configure your escrow contract, roles, and
								milestones
							</p>
						</div>
					</div>
				</motion.header>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.2,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
				>
					<EscrowAdminPanel
						projectId={project.id}
						projectSlug={projectSlug}
						projectTitle={project.title}
						projectDescription={project.description}
						escrowContractAddress={project.escrowContractAddress}
						escrowType={project.escrowType}
					/>
				</motion.div>
			</motion.div>
		</div>
	)
}
