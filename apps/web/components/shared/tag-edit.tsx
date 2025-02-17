'use client'

import { Check, X } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { ProjectTag } from '../../lib/types/project.types'
import { formatToPascalCase } from '../../lib/utils/tag-context'
import { Input } from '../base/input'

interface TagEditProps {
	tag: ProjectTag
	onUpdate: (tagId: string, newTagName: string) => void
	onCancel: () => void
}

export function TagEdit({ tag, onUpdate, onCancel }: TagEditProps) {
	const [editedTag, setEditedTag] = useState(tag.text)
	// const [error, setError] = useState('')

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			if (editedTag.trim()) {
				const formattedNewTag = formatToPascalCase(editedTag)
				if (formattedNewTag !== tag.text) {
					onUpdate(tag.id, formattedNewTag)
				} else {
					onCancel()
				}
			} else {
				toast.error('Tag name cannot be empty')
			}
		},
		[editedTag, tag, onUpdate, onCancel],
	)

	return (
		<form onSubmit={handleSubmit} className="flex items-center">
			<Input
				type="text"
				value={editedTag}
				onChange={(e) => setEditedTag(e.target.value)}
				className="px-2 py-1 border rounded-2xl mr-2"
				style={{
					backgroundColor: tag.color.backgroundColor,
					color: tag.color.textColor,
				}}
			/>
			<button
				type="submit"
				className="p-1 text-green-600 rounded mr-1 transition-colors"
				title="Save"
			>
				<Check size={16} />
			</button>
			<button
				type="button"
				onClick={onCancel}
				className="p-1 text-red-500 rounded  transition-colors"
				title="Cancel"
			>
				<X size={16} />
			</button>
			{/* {error && <p className="text-red-500 ml-2">{error}</p>} */}
		</form>
	)
}
