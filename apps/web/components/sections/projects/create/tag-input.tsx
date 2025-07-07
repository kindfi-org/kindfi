'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { TagBadge } from '~/components/sections/projects/create/tag-badge'
import type { Tag } from '~/lib/types/project/create-project.types'

interface TagInputProps {
	value: Tag[]
	onChange: (tags: Tag[]) => void
	error?: string
	placeholder?: string
	maxTags?: number
}

export function TagInput({
	value,
	onChange,
	error,
	placeholder = 'Enter a tag',
	maxTags = 10,
}: TagInputProps) {
	const [newTag, setNewTag] = useState('')
	const [selectedColor, setSelectedColor] = useState('#3B82F6') // Default blue
	const [showPreview, setShowPreview] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const colorInputRef = useRef<HTMLInputElement>(null)

	// Show preview when user starts typing
	useEffect(() => {
		setShowPreview(newTag.trim().length > 0)
	}, [newTag])

	const addTag = () => {
		const tagLabel = newTag.trim().toUpperCase()
		if (!tagLabel) return

		// Check if tag already exists
		if (value.find((tag) => tag.label === tagLabel)) return

		// Check max tags limit
		if (value.length >= maxTags) return

		const newTagObj: Tag = {
			label: tagLabel,
			color: selectedColor,
		}

		onChange([...value, newTagObj])
		setNewTag('')
		setShowPreview(false)

		// Focus back to input for better UX
		inputRef.current?.focus()
	}

	const removeTag = (indexToRemove: number) => {
		onChange(value.filter((_, index) => index !== indexToRemove))
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addTag()
		} else if (e.key === 'Escape') {
			setNewTag('')
			setShowPreview(false)
		}
	}

	const handleColorClick = () => {
		colorInputRef.current?.click()
	}

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedColor(e.target.value)
	}

	const canAddTag =
		newTag.trim().length > 0 &&
		!value.find((tag) => tag.label === newTag.trim().toUpperCase()) &&
		value.length < maxTags

	return (
		<div className="space-y-4">
			{/* Input and Color Picker */}
			<div className="flex gap-2">
				<div className="flex-1 relative">
					<Input
						ref={inputRef}
						type="text"
						placeholder={placeholder}
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						onKeyDown={handleKeyPress}
						className="pr-12 border-green-600 bg-white"
						aria-label="Add tag"
						maxLength={20}
					/>

					{/* Color picker circle */}
					<div className="absolute inset-y-0 right-2 flex items-center">
						<button
							type="button"
							onClick={handleColorClick}
							className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
							style={{ backgroundColor: selectedColor }}
							aria-label="Choose tag color"
							title="Click to choose color"
						/>
						<input
							ref={colorInputRef}
							type="color"
							value={selectedColor}
							onChange={handleColorChange}
							className="sr-only"
							aria-label="Color picker"
						/>
					</div>
				</div>

				<Button
					type="button"
					onClick={addTag}
					disabled={!canAddTag}
					aria-label="Add tag"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Tag Preview */}
			<AnimatePresence>
				{showPreview && newTag.trim() && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="flex items-center gap-2"
					>
						<span className="text-sm text-muted-foreground">Preview:</span>
						<TagBadge
							tag={{ label: newTag.trim().toUpperCase(), color: selectedColor }}
							onRemove={() => {}}
							showRemoveButton={false}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Existing Tags */}
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((tag, index) => (
						<TagBadge
							key={`${tag.label}-${index}`}
							tag={tag}
							onRemove={() => removeTag(index)}
							showRemoveButton={true}
						/>
					))}
				</div>
			)}

			{/* Max tags warning */}
			{value.length >= maxTags && (
				<p className="text-sm text-amber-600">
					Maximum of {maxTags} tags reached
				</p>
			)}

			{/* Error message */}
			{error && <p className="text-sm text-red-600">{error}</p>}

			{/* Tags count */}
			<p className="text-xs text-gray-500">
				{value.length}/{maxTags} tags
			</p>
		</div>
	)
}
