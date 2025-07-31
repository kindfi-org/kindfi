'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Shuffle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { TagBadge } from '~/components/sections/projects/create/tag-badge'
import type { Tag } from '~/lib/types/project/create-project.types'
import { cn } from '~/lib/utils'
import { generateDistinctRandomColor } from '~/lib/utils/color-utils'

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
	const [selectedColor, setSelectedColor] = useState('')
	const [showPreview, setShowPreview] = useState(false)
	const [colorError, setColorError] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const colorInputRef = useRef<HTMLInputElement>(null)

	// Generate initial random color when component mounts or when tags change
	useEffect(() => {
		if (!selectedColor) {
			const existingColors = value.map((tag) => tag.color)
			const randomColor = generateDistinctRandomColor(existingColors)
			setSelectedColor(randomColor)
		}
	}, [selectedColor, value])

	// Show preview when user starts typing
	useEffect(() => {
		setShowPreview(newTag.trim().length > 0)
	}, [newTag])

	// Check if the selected color is already used by another tag
	const isColorDuplicate = (color: string): boolean => {
		return value.some((tag) => tag.color.toLowerCase() === color.toLowerCase())
	}

	// Find which tag is using the duplicate color
	const findTagWithColor = (color: string): Tag | undefined => {
		return value.find((tag) => tag.color.toLowerCase() === color.toLowerCase())
	}

	const generateNewRandomColor = () => {
		const existingColors = value.map((tag) => tag.color)
		const newRandomColor = generateDistinctRandomColor(existingColors)
		setSelectedColor(newRandomColor)
		setColorError('')
	}

	const addTag = () => {
		const tagName = newTag.trim().toUpperCase()
		if (!tagName) return

		// Check if tag already exists
		if (value.find((tag) => tag.name === tagName)) return

		// Check max tags limit
		if (value.length >= maxTags) return

		// Check for duplicate color
		if (isColorDuplicate(selectedColor)) {
			const duplicateTag = findTagWithColor(selectedColor)
			setColorError(
				`This color is already used by "${duplicateTag?.name}" tag`,
			)
			return
		}

		const newTagObj: Tag = {
			name: tagName,
			color: selectedColor,
		}

		onChange([...value, newTagObj])
		setNewTag('')
		setShowPreview(false)
		setColorError('')

		// Generate a new random color for the next tag
		const updatedExistingColors = [
			...value.map((tag) => tag.color),
			selectedColor,
		]
		const nextRandomColor = generateDistinctRandomColor(updatedExistingColors)
		setSelectedColor(nextRandomColor)

		// Focus back to input for better UX
		inputRef.current?.focus()
	}

	const removeTag = (indexToRemove: number) => {
		const removedTag = value[indexToRemove]
		onChange(value.filter((_, index) => index !== indexToRemove))

		// Clear color error if the removed tag was causing the duplicate color error
		if (
			colorError &&
			removedTag.color.toLowerCase() === selectedColor.toLowerCase()
		) {
			setColorError('')
		}
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
		const newColor = e.target.value
		setSelectedColor(newColor)

		// Check for duplicate color and show error immediately
		if (isColorDuplicate(newColor)) {
			const duplicateTag = findTagWithColor(newColor)
			setColorError(
				`This color is already used by "${duplicateTag?.name}" tag`,
			)
		} else {
			setColorError('') // Clear error if color is unique
		}
	}

	const canAddTag =
		newTag.trim().length > 0 &&
		!value.find((tag) => tag.name === newTag.trim().toUpperCase()) &&
		value.length < maxTags &&
		!colorError

	return (
		<div className="space-y-4">
			{/* Input and Color Controls */}
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

					{/* Color controls container */}
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
						{/* Random color generator button */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={generateNewRandomColor}
							className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
							aria-label="Generate random color"
							title="Generate random color"
						>
							<Shuffle className="h-3 w-3 text-gray-500" />
						</Button>
						<button
							type="button"
							onClick={handleColorClick}
							className={cn(
								'w-6 h-6 rounded-full border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
								colorError
									? 'border-red-400 hover:border-red-500'
									: 'border-gray-300 hover:border-gray-400',
							)}
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

			{/* Color Error Message */}
			{colorError && (
				<p className="text-[0.8rem] font-medium text-destructive">
					{colorError}
				</p>
			)}

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
							tag={{ name: newTag.trim().toUpperCase(), color: selectedColor }}
							onRemove={() => { }}
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
							key={`${tag.name}`}
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
			{error && (
				<p className="text-[0.8rem] font-medium text-destructive">{error}</p>
			)}

			{/* Tags count and color info */}
			<div className="flex justify-between items-center">
				<p className="text-xs text-gray-500">
					{value.length}/{maxTags} tags
				</p>
				<p className="text-xs text-gray-400">
					<Shuffle className="h-3 w-3 inline mr-1" />
					Click shuffle for random color
				</p>
			</div>
		</div>
	)
}
