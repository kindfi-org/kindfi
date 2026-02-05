'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoCreateOutline } from 'react-icons/io5'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { UpdateProjectFormSkeleton } from './skeletons'
import { UpdateProjectForm } from './update-project-form'

interface UpdateProjectWrapperProps {
	projectSlug: string
}

export function UpdateProjectWrapper({
	projectSlug,
}: UpdateProjectWrapperProps) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

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
					className="flex flex-col items-center justify-center mb-8"
				>
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-sm">
							<IoCreateOutline size={24} className="relative z-10" />
						</div>
						<div>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
								Edit Project Basics
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mt-2 text-center">
								Update your project&apos;s core information and social media
								presence
							</p>
						</div>
					</div>
				</motion.header>

				{/* Form */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.2,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
				>
					{isLoading ? (
						<UpdateProjectFormSkeleton />
					) : (
						<UpdateProjectForm project={project} />
					)}
				</motion.div>
			</motion.div>
		</div>
	)
}
