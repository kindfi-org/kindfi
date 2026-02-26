'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	IoAddOutline,
	IoCheckmark,
	IoInformationCircleOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { ExampleHighlights } from '~/components/sections/project/highlights/example-highlights'
import { ProjectHighlightCard } from '~/components/sections/project/highlights/project-highlight-card'
import { WritingTips } from '~/components/sections/project/highlights/writing-tips'
import { useHighlightsMutation } from '~/hooks/projects/use-highlights-mutation'
import { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'
import { generateUniqueId } from '~/lib/utils/id'

interface Highlight {
	id: string
	title: string
	description: string
}

export default function ProjectHighlights() {
	const params = useParams()
	const projectSlug = params?.slug as string
	const prefersReducedMotion = useReducedMotion()

	// Fetch existing highlights
	const { data: highlightsData, isLoading } = useSupabaseQuery(
		'project-highlights',
		(client) => getProjectHighlights(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	// Initialize highlights with defaults
	const [highlights, setHighlights] = useState<Highlight[]>(() => [
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
	])

	// Sync highlights when data loads from server
	// Using a ref to track if we've initialized to avoid unnecessary updates
	const [isInitialized, setIsInitialized] = useState(false)

	useEffect(() => {
		if (
			!isInitialized &&
			highlightsData?.highlights &&
			highlightsData.highlights.length > 0
		) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHighlights(highlightsData.highlights)
			setIsInitialized(true)
		}
	}, [highlightsData, isInitialized])

	const { mutateAsync: saveHighlights, isPending } = useHighlightsMutation()

	const handleHighlightChange = (
		id: string,
		field: keyof Omit<Highlight, 'id'>,
		value: string,
	) => {
		setHighlights(
			highlights.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
		)
	}

	const addHighlight = () => {
		setHighlights([
			...highlights,
			{
				id: generateUniqueId('highlight-'),
				title: '',
				description: '',
			},
		])
	}

	const removeHighlight = (id: string) => {
		setHighlights(highlights.filter((h) => h.id !== id))
	}

	const isValid =
		highlights.length >= 2 &&
		highlights.every((h) => h.title.trim() && h.description.trim())

	const completedCount = highlights.filter(
		(h) => h.title.trim() && h.description.trim(),
	).length
	const minRequired = 2

	const handleSave = async () => {
		if (!isValid || !highlightsData?.projectId) return

		try {
			await saveHighlights({
				projectId: highlightsData.projectId,
				projectSlug,
				highlights,
			})
		} catch (error) {
			// Error is handled by the mutation hook (toast notification)
			console.error('Failed to save highlights:', error)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12"
			>
				<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
					{/* Main Content */}
					<div className="flex-1 space-y-8">
						{/* Header */}
						<motion.header
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="space-y-4"
						>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-3 text-white shadow-sm">
									<IoStarOutline size={24} className="relative z-10" />
								</div>
								<div>
									<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
										Project Highlights
									</h1>
									<p className="text-lg md:text-xl text-muted-foreground mt-2">
										Showcase your key achievements and metrics that make your
										project stand out
									</p>
								</div>
							</div>

							{/* Progress Indicator */}
							<div className="flex items-center gap-4 pt-2">
								<Badge
									variant="outline"
									className={`${
										completedCount >= minRequired
											? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900'
											: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
									} text-sm font-semibold px-4 py-1.5`}
								>
									{completedCount} of {highlights.length} highlights completed
								</Badge>
								{completedCount < minRequired && (
									<span className="text-sm text-muted-foreground">
										{minRequired - completedCount} more required
									</span>
								)}
							</div>
						</motion.header>

						{/* Highlights Form */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
						>
							<Card className="border border-border bg-card shadow-sm">
								<CardHeader className="pb-6">
									<CardTitle className="text-2xl font-semibold">
										Your Highlights
									</CardTitle>
									<CardDescription>
										Add at least {minRequired} highlights to showcase your
										project&apos;s achievements
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<motion.div
										layout
										className="space-y-6"
										transition={{
											layout: { duration: prefersReducedMotion ? 0 : 0.3 },
										}}
									>
										{highlights.map((highlight, index) => (
											<motion.div
												key={highlight.id}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												transition={{
													duration: prefersReducedMotion ? 0 : 0.2,
													delay: index * 0.05,
												}}
												layout
											>
												<ProjectHighlightCard
													{...highlight}
													onChange={handleHighlightChange}
													showDelete={highlights.length > minRequired}
													onDelete={() => removeHighlight(highlight.id)}
													index={index + 1}
												/>
											</motion.div>
										))}
									</motion.div>

									{/* Add Highlight Button */}
									<motion.div
										whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
										whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
									>
										<Button
											variant="outline"
											className="w-full border-border bg-background hover:bg-muted/50 transition-colors duration-200 font-medium"
											onClick={addHighlight}
											startIcon={<IoAddOutline />}
										>
											Add another highlight
										</Button>
									</motion.div>

									{/* Info Alert */}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.3 }}
										className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg"
									>
										<IoInformationCircleOutline
											className="text-primary mt-0.5 flex-shrink-0"
											size={20}
										/>
										<div className="flex-1 space-y-1">
											<h4 className="font-medium text-sm">
												Tips for great highlights
											</h4>
											<p className="text-sm text-muted-foreground">
												Focus on concrete achievements, metrics, or milestones.
												Be specific and use numbers when possible. Make each
												highlight unique and compelling.
											</p>
										</div>
									</motion.div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Save Button */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="flex justify-end gap-4"
						>
							<Button
								variant="outline"
								onClick={() => {
									// Handle cancel/navigation
								}}
								className="hidden sm:flex"
							>
								Cancel
							</Button>
							<Button
								disabled={!isValid || isPending || isLoading}
								onClick={handleSave}
								variant="primary-gradient"
								endIcon={<IoCheckmark size={18} />}
								className="w-full sm:w-auto min-w-[160px]"
							>
								{isPending ? 'Saving...' : 'Save Highlights'}
							</Button>
						</motion.div>
					</div>

					{/* Sidebar */}
					<motion.aside
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
						className="lg:w-[400px] space-y-8"
					>
						<ExampleHighlights />
						<WritingTips />
					</motion.aside>
				</div>
			</motion.div>
		</div>
	)
}
