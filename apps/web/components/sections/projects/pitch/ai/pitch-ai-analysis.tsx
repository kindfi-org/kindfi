'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
	AlertCircle,
	Bot,
	CheckCircle2,
	Loader2,
	RefreshCw,
	Sparkles,
	X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { ScrollArea } from '~/components/base/scroll-area'
import { Separator } from '~/components/base/separator'
import type { AnalysisStatus } from '~/hooks/projects/use-pitch-analysis'

interface PitchAIAnalysisProps {
	analysis: string
	status: AnalysisStatus
	onAnalyze: () => void
	onReset: () => void
	isLoading: boolean
	hasContent: boolean
}

const StatusIndicator = ({ status }: { status: AnalysisStatus }) => {
	if (status === 'loading') {
		return (
			<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Loader2 className="h-3 w-3 animate-spin" />
				Preparing analysis…
			</span>
		)
	}
	if (status === 'streaming') {
		return (
			<span className="flex items-center gap-1.5 text-xs text-blue-600">
				<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
				Generating recommendations…
			</span>
		)
	}
	if (status === 'done') {
		return (
			<span className="flex items-center gap-1.5 text-xs text-emerald-600">
				<CheckCircle2 className="h-3 w-3" />
				Analysis complete
			</span>
		)
	}
	if (status === 'error') {
		return (
			<span className="flex items-center gap-1.5 text-xs text-destructive">
				<AlertCircle className="h-3 w-3" />
				Something went wrong
			</span>
		)
	}
	return null
}

export const PitchAIAnalysis = ({
	analysis,
	status,
	onAnalyze,
	onReset,
	isLoading,
	hasContent,
}: PitchAIAnalysisProps) => {
	const shouldReduceMotion = useReducedMotion()

	const showResults = status === 'streaming' || status === 'done'
	const showError = status === 'error'
	const showIdle = status === 'idle'

	return (
		<Card className="p-6 shadow-md hover:shadow-lg transition-shadow bg-white border-purple-100">
			{/* Header */}
			<div className="flex items-start justify-between gap-2 mb-4">
				<div className="flex items-center gap-2">
					<div className="rounded-md bg-gradient-to-br from-purple-500 to-pink-600 p-1.5 text-white">
						<Bot className="h-4 w-4" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-base font-semibold leading-tight">
							AI Pitch Advisor
						</h3>
						<StatusIndicator status={status} />
					</div>
				</div>

				{(status === 'done' || status === 'error') && (
					<button
						type="button"
						onClick={onReset}
						aria-label="Dismiss analysis"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			<Separator className="mb-4" />

			{/* Idle state */}
			{showIdle && (
				<motion.div
					initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="space-y-3"
				>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Get personalized feedback and recommendations from our AI advisor
						to strengthen your pitch before publishing.
					</p>
					<ul className="space-y-1.5 text-sm text-muted-foreground">
						{[
							'Clarity & compelling hook',
							'Impact & storytelling quality',
							'Call-to-action effectiveness',
							'Concrete improvement suggestions',
						].map((item) => (
							<li key={item} className="flex items-center gap-2">
								<Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
								<span>{item}</span>
							</li>
						))}
					</ul>
					<Button
						type="button"
						onClick={onAnalyze}
						disabled={!hasContent}
						className="w-full mt-2 gradient-btn text-white"
						size="sm"
					>
						<Sparkles className="h-3.5 w-3.5 mr-2" />
						Analyze My Pitch
					</Button>
					{!hasContent && (
						<p className="text-xs text-muted-foreground text-center">
							Fill in the title and story first
						</p>
					)}
				</motion.div>
			)}

			{/* Loading skeleton */}
			{status === 'loading' && (
				<div className="space-y-2" aria-live="polite" aria-busy="true">
					{([
						{ w: 80, id: 'sk-a' },
						{ w: 60, id: 'sk-b' },
						{ w: 90, id: 'sk-c' },
						{ w: 50, id: 'sk-d' },
						{ w: 70, id: 'sk-e' },
					] as const).map(({ w, id }) => (
						<div
							key={id}
							className="h-3 rounded-full bg-gradient-to-r from-muted to-muted/40 animate-pulse"
							style={{ width: `${w}%` }}
						/>
					))}
				</div>
			)}

			{/* Analysis content */}
			{showResults && analysis && (
				<motion.div
					initial={shouldReduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4 }}
				>
					<ScrollArea className="h-[420px] pr-2">
						<div
							className="prose prose-sm prose-neutral max-w-none
								prose-headings:font-semibold prose-headings:text-foreground
								prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2
								prose-li:text-muted-foreground prose-li:marker:text-purple-500
								prose-strong:text-foreground
								prose-p:text-muted-foreground prose-p:leading-relaxed"
							aria-live="polite"
						>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{analysis}
							</ReactMarkdown>
						</div>
					</ScrollArea>

					{status === 'done' && (
						<div className="mt-4 pt-3 border-t border-border">
							<Button
								type="button"
								onClick={onAnalyze}
								variant="outline"
								size="sm"
								className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
								disabled={isLoading}
							>
								<RefreshCw className="h-3.5 w-3.5 mr-2" />
								Re-analyze
							</Button>
						</div>
					)}
				</motion.div>
			)}

			{/* Error state */}
			{showError && (
				<motion.div
					initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-3"
				>
					<div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
						<p className="text-sm text-destructive">
							The analysis could not be completed. Please try again.
						</p>
					</div>
					<Button
						type="button"
						onClick={onAnalyze}
						variant="outline"
						size="sm"
						className="w-full"
						disabled={isLoading}
					>
						<RefreshCw className="h-3.5 w-3.5 mr-2" />
						Try Again
					</Button>
				</motion.div>
			)}
		</Card>
	)
}
