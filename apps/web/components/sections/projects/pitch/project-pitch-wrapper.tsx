'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useCallback, useState } from 'react'
import { IoMegaphoneOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'
import { usePitchAnalysis } from '~/hooks/projects/use-pitch-analysis'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { PitchAIAnalysis } from './ai/pitch-ai-analysis'
import { ProjectPitchForm } from './project-pitch-form'
import { ProjectPitchFormSkeleton } from './skeleton'
import { TipsSidebar } from './tips-sidebar'

interface ProjectPitchWrapperProps {
	projectSlug: string
}

export function ProjectPitchWrapper({ projectSlug }: ProjectPitchWrapperProps) {
	const prefersReducedMotion = useReducedMotion()
	const [aiEnabled, setAiEnabled] = useState(false)
	const [pitchSnapshot, setPitchSnapshot] = useState<{
		title: string
		story: string
	} | null>(null)

	const { analysis, status, analyze, reset, isLoading } = usePitchAnalysis()

	const {
		data: project,
		isLoading: isProjectLoading,
		error,
	} = useSupabaseQuery(
		'project-pitch',
		(client) => getProjectPitchDataBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	const handleActivateAI = useCallback(
		(title: string, story: string) => {
			setPitchSnapshot({ title, story })
			setAiEnabled(true)
			analyze(title, story)
		},
		[analyze],
	)

	const handleReanalyze = useCallback(() => {
		if (pitchSnapshot) {
			analyze(pitchSnapshot.title, pitchSnapshot.story)
		}
	}, [pitchSnapshot, analyze])

	const handleDismiss = useCallback(() => {
		reset()
		setAiEnabled(false)
		setPitchSnapshot(null)
	}, [reset])

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
						{isProjectLoading ? (
							<ProjectPitchFormSkeleton />
						) : (
							<ProjectPitchForm
								projectId={project.id}
								projectSlug={project.slug}
								pitch={project.pitch}
							/>
						)}
					</div>

					<aside className="lg:col-span-1 space-y-6">
						{aiEnabled ? (
							<motion.div
								initial={
									prefersReducedMotion ? false : { opacity: 0, y: -8 }
								}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<PitchAIAnalysis
									analysis={analysis}
									status={status}
									onAnalyze={handleReanalyze}
									onReset={handleDismiss}
									isLoading={isLoading}
									hasContent={
										!!(pitchSnapshot?.title && pitchSnapshot?.story)
									}
								/>
							</motion.div>
						) : (
							<motion.div
								initial={
									prefersReducedMotion ? false : { opacity: 0, y: 8 }
								}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.2 }}
								className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-5 text-center space-y-3"
							>
								<div className="flex justify-center">
									<div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 text-white">
										<Sparkles className="h-5 w-5" aria-hidden="true" />
									</div>
								</div>
								<div>
									<p className="text-sm font-medium text-foreground">
										AI Pitch Advisor
									</p>
									<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
										Get personalized feedback on your pitch once you&apos;ve
										filled in the title and story.
									</p>
								</div>
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={
										isProjectLoading ||
										!project?.pitch?.title ||
										!project?.pitch?.story
									}
									onClick={() => {
										const title = project?.pitch?.title ?? ''
										const story = project?.pitch?.story ?? ''
										handleActivateAI(title, story)
									}}
									className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400"
								>
									<Sparkles className="h-3.5 w-3.5 mr-2" />
									Activate AI Advisor
								</Button>
								{(!project?.pitch?.title || !project?.pitch?.story) && (
									<p className="text-xs text-muted-foreground">
										Save your pitch first to enable this feature
									</p>
								)}
							</motion.div>
						)}

						<TipsSidebar />
					</aside>
				</motion.section>
			</motion.div>
		</div>
	)
}
