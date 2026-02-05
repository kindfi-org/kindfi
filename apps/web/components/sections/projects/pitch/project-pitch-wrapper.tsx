'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoMegaphoneOutline } from 'react-icons/io5'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { ProjectPitchForm } from './project-pitch-form'
import { ProjectPitchFormSkeleton } from './skeleton'
import { TipsSidebar } from './tips-sidebar'

interface ProjectPitchWrapperProps {
	projectSlug: string
}

export function ProjectPitchWrapper({ projectSlug }: ProjectPitchWrapperProps) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project-pitch',
		(client) => getProjectPitchDataBySlug(client, projectSlug),
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
						<div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white shadow-sm">
							<IoMegaphoneOutline size={24} className="relative z-10" />
						</div>
						<div>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
								Project Pitch
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mt-2 text-center">
								Create a compelling pitch that showcases your project&apos;s
								impact and inspires supporters to join your mission
							</p>
						</div>
					</div>
				</motion.header>

				{/* Content */}
				<motion.section
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.2,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
					className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto"
				>
					<div className="lg:col-span-2">
						{isLoading ? (
							<ProjectPitchFormSkeleton />
						) : (
							<ProjectPitchForm
								projectId={project.id}
								projectSlug={project.slug}
								pitch={project.pitch}
							/>
						)}
					</div>
					<aside className="lg:col-span-1">
						<TipsSidebar />
					</aside>
				</motion.section>
			</motion.div>
		</div>
	)
}
