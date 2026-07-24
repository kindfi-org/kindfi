'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	IoAddOutline,
	IoCheckmark,
	IoInformationCircleOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { logger } from '@/lib/logger'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { ExampleHighlights } from '~/components/sections/project/highlights/example-highlights'
import { ProjectHighlightCard } from '~/components/sections/project/highlights/project-highlight-card'
import { WritingTips } from '~/components/sections/project/highlights/writing-tips'
import { useHighlightsMutation } from '~/hooks/projects/use-highlights-mutation'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useI18n } from '~/lib/i18n/context'
import type { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'
import { getOppositeLocale } from '~/lib/schemas/locale.schemas'
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
	const { t } = useI18n()

	// Fetch existing highlights
	const { data: highlightsData, isLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectHighlights>>
	>('project-highlights', projectSlug, 'highlights', { additionalKeyValues: [projectSlug] })

	// Initialize highlights with defaults
	const [highlights, setHighlights] = useState<Highlight[]>(() => [
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
		{ id: generateUniqueId('highlight-'), title: '', description: '' },
	])
	const [translationHighlights, setTranslationHighlights] = useState<Highlight[]>(() => [
		{ id: generateUniqueId('translation-highlight-'), title: '', description: '' },
		{ id: generateUniqueId('translation-highlight-'), title: '', description: '' },
	])

	// Sync highlights when data loads from server
	// Using a ref to track if we've initialized to avoid unnecessary updates
	const [isInitialized, setIsInitialized] = useState(false)

	useEffect(() => {
		if (!isInitialized && highlightsData?.highlights && highlightsData.highlights.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHighlights(highlightsData.highlights)
			setTranslationHighlights(
				highlightsData.translationHighlights?.length
					? highlightsData.translationHighlights
					: highlightsData.highlights.map(() => ({
							id: generateUniqueId('translation-highlight-'),
							title: '',
							description: '',
						})),
			)
			setIsInitialized(true)
		}
	}, [highlightsData, isInitialized])

	const sourceLocale = highlightsData?.sourceLocale ?? 'en'
	const oppositeLocale = getOppositeLocale(sourceLocale)
	const sourceTabLabel =
		sourceLocale === 'en'
			? t('projects.manage.highlightsEnglishTab')
			: t('projects.manage.highlightsSpanishTab')
	const translationTabLabel =
		oppositeLocale === 'en'
			? t('projects.manage.highlightsEnglishTab')
			: t('projects.manage.highlightsSpanishTab')

	const { mutateAsync: saveHighlights, isPending } = useHighlightsMutation()

	const handleHighlightChange = (
		id: string,
		field: keyof Omit<Highlight, 'id'>,
		value: string,
		isTranslation = false,
	) => {
		const updater = (items: Highlight[]) =>
			items.map((h) => (h.id === id ? { ...h, [field]: value } : h))

		if (isTranslation) {
			setTranslationHighlights(updater)
			return
		}

		setHighlights(updater)
	}

	const addHighlight = (isTranslation = false) => {
		const newHighlight = {
			id: generateUniqueId(isTranslation ? 'translation-highlight-' : 'highlight-'),
			title: '',
			description: '',
		}

		if (isTranslation) {
			setTranslationHighlights((items) => [...items, newHighlight])
			return
		}

		setHighlights((items) => [...items, newHighlight])
		setTranslationHighlights((items) => [
			...items,
			{
				id: generateUniqueId('translation-highlight-'),
				title: '',
				description: '',
			},
		])
	}

	const removeHighlight = (id: string, isTranslation = false) => {
		if (isTranslation) {
			setTranslationHighlights((items) => items.filter((h) => h.id !== id))
			return
		}

		const index = highlights.findIndex((h) => h.id === id)
		setHighlights((items) => items.filter((h) => h.id !== id))
		if (index >= 0) {
			setTranslationHighlights((items) => items.filter((_, itemIndex) => itemIndex !== index))
		}
	}

	const isValid =
		highlights.length >= 2 &&
		highlights.every((h) => h.title.trim() && h.description.trim()) &&
		translationHighlights.length >= 2 &&
		translationHighlights.every((h) => h.title.trim() && h.description.trim())

	const completedCount = highlights.filter((h) => h.title.trim() && h.description.trim()).length
	const minRequired = 2

	const handleSave = async () => {
		if (!isValid || !highlightsData?.projectId) return

		try {
			await saveHighlights({
				projectId: highlightsData.projectId,
				projectSlug,
				highlights,
				translationHighlights,
			})
		} catch (error) {
			// Error is handled by the mutation hook (toast notification)
			logger.error('Failed to save highlights:', error)
		}
	}

	const renderHighlightsEditor = (items: Highlight[], isTranslation: boolean, tabLabel: string) => (
		<div className="space-y-6">
			<div className="rounded-lg border border-border bg-muted/30 p-4">
				<p className="text-sm text-muted-foreground">
					{t('projects.manage.translationSectionDescription')}
				</p>
				<p className="mt-1 text-sm font-medium">{tabLabel}</p>
			</div>

			<motion.div
				layout
				className="space-y-6"
				transition={{
					layout: { duration: prefersReducedMotion ? 0 : 0.3 },
				}}
			>
				{items.map((highlight, index) => (
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
							onChange={(id, field, value) =>
								handleHighlightChange(id, field, value, isTranslation)
							}
							showDelete={items.length > minRequired}
							onDelete={() => removeHighlight(highlight.id, isTranslation)}
							index={index + 1}
						/>
					</motion.div>
				))}
			</motion.div>

			<motion.div
				whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
				whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
			>
				<Button
					variant="outline"
					className="w-full border-border bg-background hover:bg-muted/50 transition-colors duration-200 font-medium"
					onClick={() => addHighlight(isTranslation)}
					startIcon={<IoAddOutline />}
				>
					Add another impact point
				</Button>
			</motion.div>
		</div>
	)

	return (
		<div className="relative">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative z-10"
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
										Campaign Impact
									</h1>
									<p className="text-lg md:text-xl text-muted-foreground mt-2">
										Share the outcomes, metrics, and proof points that show your campaign&apos;s
										impact
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
									{completedCount} of {highlights.length} impact points completed
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
									<CardTitle className="text-2xl font-semibold">Your Campaign Impact</CardTitle>
									<CardDescription>
										Add at least {minRequired} impact points that demonstrate your campaign&apos;s
										results
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<Tabs defaultValue="source" className="w-full">
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="source">{sourceTabLabel}</TabsTrigger>
											<TabsTrigger value="translation">{translationTabLabel}</TabsTrigger>
										</TabsList>
										<TabsContent value="source" className="mt-6">
											{renderHighlightsEditor(highlights, false, sourceTabLabel)}
										</TabsContent>
										<TabsContent value="translation" className="mt-6">
											{renderHighlightsEditor(translationHighlights, true, translationTabLabel)}
										</TabsContent>
									</Tabs>

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
											<h4 className="font-medium text-sm">Tips for strong impact points</h4>
											<p className="text-sm text-muted-foreground">
												Focus on concrete achievements, metrics, or milestones. Be specific and use
												numbers when possible. Make each impact point unique and compelling.
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
								{isPending ? 'Saving...' : 'Save Campaign Impact'}
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
