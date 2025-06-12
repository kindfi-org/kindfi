'use client'

import { Check, X } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '~/components/base/input'
import type { Tag } from '~/lib/types/projects.types'
import { getTagColors } from '~/lib/utils/categories-util'
import { formatToPascalCase } from '~/lib/utils/tag-context'

type TagEditProps = {
	tag: Tag
	onUpdate: (tagId: string, newTagName: string) => void
	onCancel: () => void
}

export function TagEdit({ tag, onUpdate, onCancel }: TagEditProps) {
	const [editedTag, setEditedTag] = useState(tag.name) // Changed from tag.text to tag.name
	// const [error, setError] = useState('')

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			if (editedTag.trim()) {
				const formattedNewTag = formatToPascalCase(editedTag)
				if (formattedNewTag !== tag.name) {
					// Changed from tag.text to tag.name
					onUpdate(tag.id as string, formattedNewTag)
				} else {
					onCancel()
				}
			} else {
				toast.error('Tag name cannot be empty')
			}
		},
		[editedTag, tag, onUpdate, onCancel],
	)

	const colors = getTagColors(tag)

	return (
		<div className="flex items-center">
			<Input
				type="text"
				value={editedTag}
				onChange={(e) => setEditedTag(e.target.value)}
				className="px-2 py-1 border rounded-sm mr-2 text-sm h-8"
				style={colors}
				onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
			/>
			<button
				type="button"
				className="p-1 text-green-600 rounded mr-1 transition-colors"
				title="Save"
				onClick={handleSubmit}
			>
				<Check size={16} />
			</button>
			<button
				type="button"
				className="p-1 text-red-500 rounded transition-colors"
				title="Cancel"
				onClick={onCancel}
			>
				<X size={16} />
			</button>
			{/* {error && <p className="text-red-500 ml-2">{error}</p>} */}
		</div>
	)
}
