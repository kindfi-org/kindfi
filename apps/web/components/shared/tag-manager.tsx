'use client'

import { Edit, X } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { formatToPascalCase, useTags } from '../../lib/utils/tag-context'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { TagEdit } from './tag-edit'

export function TagManager() {
	const { tags, addTag, removeTag, updateTag } = useTags()
	const [newTag, setNewTag] = useState('')
	// const [error, setError] = useState('')
	const [editingTagId, setEditingTagId] = useState<string | null>(null)

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			if (newTag.trim()) {
				const formattedNewTag = formatToPascalCase(newTag)
				if (tags.some((tag) => tag.text === formattedNewTag)) {
					toast.error('Tag already exists')
				} else {
					addTag(newTag)
					setNewTag('')
					toast.error(`Tag "${newTag}" created`)
				}
			} else {
				toast.error('Tag name cannot be empty')
			}
		},
		[newTag, tags, addTag],
	)

	const handleEdit = useCallback((tagId: string) => {
		setEditingTagId(tagId)
	}, [])

	const handleUpdate = useCallback(
		(tagId: string, newTagName: string) => {
			updateTag(tagId, newTagName)
			setEditingTagId(null)
			toast.success(`Tag updated to "${newTagName}"`)
		},
		[updateTag],
	)

	const handleCancelEdit = useCallback(() => {
		setEditingTagId(null)
	}, [])

	return (
		<div className="p-4 rounded-lg">
			<form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
				<Input
					type="text"
					value={newTag}
					onChange={(e) => setNewTag(e.target.value)}
					placeholder="Enter new tag"
					className="border border-gray-300 rounded-lg px-2 py-1"
				/>
				<Button type="submit" variant="secondary" disabled={!newTag.trim()}>
					Add Tag
				</Button>
			</form>

			{/* {error && <p className="text-red-500 mb-2">{error}</p>} */}
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) =>
					editingTagId === tag.id ? (
						<TagEdit
							key={tag.id}
							tag={tag}
							onUpdate={handleUpdate}
							onCancel={handleCancelEdit}
						/>
					) : (
						<div
							key={tag.id}
							className="flex items-center px-2 py-1 rounded-full"
							style={{ backgroundColor: tag.color.backgroundColor }}
						>
							<span style={{ color: tag.color.textColor }}>{tag.text}</span>
							<Button
								onClick={() => handleEdit(tag.id)}
								className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
								style={{ color: tag.color.textColor }}
								title="Edit"
							>
								<Edit size={9} />
							</Button>
							<Button
								onClick={() => removeTag(tag.id)}
								className="ml-1 p-1 rounded hover:bg-white/20 transition-colors"
								style={{ color: tag.color.textColor }}
								title="Remove"
							>
								<X size={9} />
							</Button>
						</div>
					),
				)}
			</div>
		</div>
	)
}
