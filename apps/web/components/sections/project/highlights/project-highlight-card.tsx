'use client'

import { IoTrashOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'

interface ProjectHighlightCardProps {
	id: string
	title: string
	description: string
	showDelete?: boolean
	onDelete?: () => void
	onChange: (id: string, field: 'title' | 'description', value: string) => void
}

export function ProjectHighlightCard({
	id,
	title,
	description,
	showDelete = false,
	onDelete,
	onChange,
}: ProjectHighlightCardProps) {
	return (
		<Card className="space-y-4 p-6 relative bg-white border border-gray-200">
			{showDelete && (
				<div className="absolute -top-3 -right-3">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-50"
						onClick={onDelete}
					>
						<IoTrashOutline size={16} className="text-gray-500" />
					</Button>
				</div>
			)}
			<div>
				<Label className="block font-medium mb-2 text-black mb-4">Title</Label>
				<Input
					placeholder="e.g., Key Achievement, Important Metric"
					value={title}
					onChange={(e) => onChange(id, 'title', e.target.value)}
					className="border-gray-200 focus-visible:ring-1 focus-visible:ring-offset-0 bg-white h-12 text-[1rem] placeholder:text-[1rem] placeholder:text-gray-500"
				/>
			</div>
			<div>
				<Label className="block font-medium mb-2 text-black mb-4">
					Description
				</Label>
				<Textarea
					placeholder="Describe your achievement or metric"
					value={description}
					onChange={(e) => onChange(id, 'description', e.target.value)}
					className="min-h-[100px] resize-none border-gray-200 focus:border-gray-300 focus:ring-gray-200 text-[1rem] placeholder:text-[1rem] placeholder:text-gray-500"
					maxLength={200}
					rows={5}
				/>
				<div className="text-sm text-gray-500 mt-1">
					{description.length}/200 characters
				</div>
			</div>
		</Card>
	)
}
