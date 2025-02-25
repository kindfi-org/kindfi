'use client'

import { Edit, X } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ProjectTag } from '~/lib/types'
import { formatToPascalCase, useTags } from '../../lib/utils/tag-context'
import { Badge } from '../base/badge'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { TagEdit } from './tag-edit'

type TagManagerProps = {
	id?: string
	onUpdate?: (tags: ProjectTag[]) => void
}

export function TagManager({ id, onUpdate }: TagManagerProps) {
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
					toast.success(`Tag "${formattedNewTag}" created`)
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
			toast.success(`Tag "${formatToPascalCase(newTagName)}" updated`)
		},
		[updateTag],
	)

	const handleCancelEdit = useCallback(() => {
		setEditingTagId(null)
	}, [])

	useEffect(() => {
		if (onUpdate) {
			onUpdate(tags)
		}
	}, [tags, onUpdate])

	return (
		<div>
			<div className="flex items-center gap-2 mb-2">
				<Input
					id={id || 'tag-input'}
					type="text"
					value={newTag}
					onChange={(e) => setNewTag(e.target.value)}
					placeholder="Enter new tag"
					className="border border-gray-300 rounded-sm px-2 py-1"
					onKeyDown={(e) =>
						(e.key === 'Enter' || e.key === ',') && handleSubmit(e)
					}
				/>
				<Button
					type="button"
					variant="secondary"
					disabled={!newTag.trim()}
					onClick={handleSubmit}
				>
					Add Tag
				</Button>
			</div>

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
						<div key={tag.id} className="flex items-center mr-2 rounded-full">
							<button
								type="button"
								className="grid place-items-center focus-visible:ring-green-500 focus-visible:ring-1 focus-visible:ring-offset-1 rounded-full duration-200 focus:outline-none"
								onClick={() => handleEdit(tag.id)}
							>
								<Badge
									style={{
										color: tag.color.textColor,
										backgroundColor: tag.color.backgroundColor,
									}}
									className="shadow-none px-3 cursor-pointer"
								>
									{tag.text}
								</Badge>
							</button>
							<Button
								onClick={() => removeTag(tag.id)}
								aria-label="Remove tag"
								className="px-1 rounded hover:bg-white/20 transition-colors w-[20px] h-[20px] focus-visible:ring-1"
								style={{ color: tag.color.textColor }}
							>
								<X size={12} aria-hidden="true" />
								<span className="sr-only">Remove tag</span>
							</Button>
						</div>
					),
				)}
			</div>
		</div>
	)
}
