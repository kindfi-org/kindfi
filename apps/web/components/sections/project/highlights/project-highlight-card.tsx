'use client'

import { motion } from 'framer-motion'
import { IoCheckmarkCircleOutline, IoTrashOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import { cn } from '~/lib/utils'

interface ProjectHighlightCardProps {
	id: string
	title: string
	description: string
	showDelete?: boolean
	onDelete?: () => void
	onChange: (id: string, field: 'title' | 'description', value: string) => void
	index?: number
}

export function ProjectHighlightCard({
	id,
	title,
	description,
	showDelete = false,
	onDelete,
	onChange,
	index,
}: ProjectHighlightCardProps) {
	const isComplete = title.trim() && description.trim()
	const charCount = description.length
	const maxChars = 200
	const isNearLimit = charCount > maxChars * 0.9

	return (
		<Card
			className={cn(
				'relative border transition-all duration-200 group',
				isComplete
					? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20'
					: 'border-border bg-card hover:border-primary/20',
			)}
		>
			{/* Header with index and delete button */}
			<div className="flex items-center justify-between p-4 pb-0">
				<div className="flex items-center gap-2">
					{index && (
						<div
							className={cn(
								'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
								isComplete
									? 'bg-green-500 text-white'
									: 'bg-muted text-muted-foreground',
							)}
						>
							{isComplete ? <IoCheckmarkCircleOutline size={14} /> : index}
						</div>
					)}
					{isComplete && (
						<motion.span
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="text-xs font-medium text-green-600 dark:text-green-400"
						>
							Complete
						</motion.span>
					)}
				</div>
				{showDelete && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
						onClick={onDelete}
						aria-label="Delete highlight"
					>
						<IoTrashOutline size={16} />
					</Button>
				)}
			</div>

			<div className="space-y-4 p-4 pt-4">
				<div className="space-y-2">
					<Label
						htmlFor={`title-${id}`}
						className="text-sm font-medium text-foreground"
					>
						Title
						<span className="text-destructive ml-1">*</span>
					</Label>
					<Input
						id={`title-${id}`}
						placeholder="e.g., Reached 10,000 users in first month"
						value={title}
						onChange={(e) => onChange(id, 'title', e.target.value)}
						className={cn(
							'h-11 transition-colors',
							isComplete && 'border-green-200 dark:border-green-800',
						)}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label
							htmlFor={`description-${id}`}
							className="text-sm font-medium text-foreground"
						>
							Description
							<span className="text-destructive ml-1">*</span>
						</Label>
						<span
							className={cn(
								'text-xs transition-colors',
								isNearLimit
									? 'text-destructive font-medium'
									: 'text-muted-foreground',
							)}
						>
							{charCount}/{maxChars}
						</span>
					</div>
					<Textarea
						id={`description-${id}`}
						placeholder="Provide specific details about this achievement. Include numbers, dates, or measurable outcomes when possible."
						value={description}
						onChange={(e) => {
							if (e.target.value.length <= maxChars) {
								onChange(id, 'description', e.target.value)
							}
						}}
						className={cn(
							'min-h-[120px] resize-y transition-colors',
							isComplete && 'border-green-200 dark:border-green-800',
							isNearLimit && 'border-destructive/50',
						)}
						rows={4}
					/>
					{charCount >= maxChars && (
						<p className="text-xs text-destructive">Character limit reached</p>
					)}
				</div>
			</div>
		</Card>
	)
}
