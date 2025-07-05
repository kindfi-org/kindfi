'use client'

import { Plus, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'

interface TagInputProps {
	value: string[]
	onChange: (tags: string[]) => void
	error?: string
}

export function TagInput({ value, onChange, error }: TagInputProps) {
	const [newTag, setNewTag] = useState('')

	const addTag = () => {
		const tag = newTag.trim().toUpperCase()
		if (tag && !value.includes(tag)) {
			onChange([...value, tag])
			setNewTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addTag()
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input
					type="text"
					placeholder="Enter a tag"
					value={newTag}
					onChange={(e) => setNewTag(e.target.value)}
					onKeyDown={handleKeyDown}
					className="flex-1 border-green-600 bg-white"
					aria-label="Add tag"
				/>
				<Button
					type="button"
					onClick={addTag}
					disabled={!newTag.trim()}
					aria-label="Add tag"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((tag) => (
						<Badge
							key={tag}
							variant="purple"
							className="flex items-center gap-1"
						>
							{tag}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => removeTag(tag)}
								aria-label={`Remove tag ${tag}`}
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					))}
				</div>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	)
}
