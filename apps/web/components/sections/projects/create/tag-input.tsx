'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { MousePointer, Plus, Shuffle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { TagBadge } from '~/components/sections/projects/create/tag-badge'
import type { Tag } from '~/lib/types/project/create-project.types'
import { cn } from '~/lib/utils'
import { generateDistinctRandomColor } from '~/lib/utils/color-utils'

interface TagInputProps {
	tags: Tag[]
	onChange: (tags: Tag[]) => void
	error?: string
	placeholder?: string
	maxTags?: number
}

export function TagInput({
	tags,
	onChange,
	error,
	placeholder = 'Enter a tag',
	maxTags = 10,
}: TagInputProps) {
	const [newTag, setNewTag] = useState('')
	const [selectedColor, setSelectedColor] = useState('')
	const [tagError, setTagError] = useState('')
	const [colorError, setColorError] = useState('')
	const [showPreview, setShowPreview] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const colorInputRef = useRef<HTMLInputElement>(null)

	// Debounce user input to limit queries
	useDebounce(() => setDebouncedSearch(searchTerm), 700, [searchTerm])

	// Fetch matching tags from Supabas
	const { data: matchingTags } = useSupabaseQuery<Tag[]>(
		'search-tags',
		async (supabase) => {
			if (!debouncedSearch) return []
			const { data, error } = await supabase
				.from('project_tags')
				.select('name, color')
				.ilike('name', `${debouncedSearch}%`)
				.limit(5)
			if (error) throw error
			return data ?? []
		},
		{
			enabled: debouncedSearch.length > 0,
			additionalKeyValues: [debouncedSearch],
			staleTime: 5_000,
		},
	)

	useEffect(() => {
		setTagError('')
		setSearchTerm(newTag)
	}, [newTag])

	useEffect(() => {
		setShowPreview(newTag.trim().length > 0)
	}, [newTag])

	// Generate a new color when none is selected
	useEffect(() => {
		if (!selectedColor) {
			const existingColors = tags.map((tag) => tag.color)
			setSelectedColor(generateDistinctRandomColor(existingColors))
		}
	}, [selectedColor, tags])

	const isColorDuplicate = (color: string) =>
		tags.some((tag) => tag.color.toLowerCase() === color.toLowerCase())

	const findTagWithColor = (color: string) =>
		tags.find((tag) => tag.color.toLowerCase() === color.toLowerCase())

	const generateNewRandomColor = () => {
		const existingColors = tags.map((tag) => tag.color)
		setSelectedColor(generateDistinctRandomColor(existingColors))
		setColorError('')
	}

	const addTag = () => {
		const tagName = newTag.trim().toUpperCase()
		if (!tagName) return
		if (tags.find((tag) => tag.name === tagName)) return
		if (tags.length >= maxTags) return
		if (isColorDuplicate(selectedColor)) {
			const duplicateTag = findTagWithColor(selectedColor)
			setColorError(`This color is already used by "${duplicateTag?.name}" tag`)
			return
		}

		const newTagObj: Tag = { name: tagName, color: selectedColor }
		onChange([...tags, newTagObj])
		setNewTag('')
		setShowPreview(false)
		setColorError('')

		const updatedColors = [...tags.map((tag) => tag.color), selectedColor]
		setSelectedColor(generateDistinctRandomColor(updatedColors))
		inputRef.current?.focus()
	}

	const removeTag = (indexToRemove: number) => {
		const removed = tags[indexToRemove]
		onChange(tags.filter((_, i) => i !== indexToRemove))

		// Reset color error if removed tag had the conflicting color
		if (
			colorError &&
			removed.color.toLowerCase() === selectedColor.toLowerCase()
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

	const handleColorClick = () => colorInputRef.current?.click()

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const color = e.target.value
		setSelectedColor(color)
		if (isColorDuplicate(color)) {
			const duplicate = findTagWithColor(color)
			setColorError(`This color is already used by "${duplicate?.name}" tag`)
		} else {
			setColorError('')
		}
	}

	const handleSelectTag = (tag: Tag) => {
		const normalizedName = tag.name.trim().toUpperCase()
		const isDuplicate = tags.some(
			(t) => t.name.trim().toUpperCase() === normalizedName,
		)

		if (isDuplicate) {
			setTagError(`The tag "${normalizedName}" is already selected`)
			return
		}

		setTagError('')
		onChange([...tags, { ...tag, name: normalizedName }])
		setNewTag('')
		setDebouncedSearch('')
	}

	const canAddTag =
		newTag.trim().length > 0 &&
		!tags.find((tag) => tag.name === newTag.trim().toUpperCase()) &&
		tags.length < maxTags &&
		!colorError

	return (
		<div className="space-y-4">
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
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
					className="bg-indigo-900 hover:bg-indigo-800 text-white flex items-center gap-2"
				>
					<Plus className="h-4 w-4 sm:hidden" />
					<span className="hidden sm:inline">Add tag</span>
				</Button>
			</div>

			{colorError && (
				<p className="text-[0.8rem] font-medium text-destructive">
					{colorError}
				</p>
			)}

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
					/>
				</motion.div>
			)}

			{/* Suggestions */}
			{debouncedSearch && matchingTags && matchingTags.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm text-gray-500">Suggestions:</p>
					<div className="flex flex-wrap gap-2">
						{matchingTags.map((tag) => (
							<TagBadge
								key={`${tag.name}-${tag.color}`}
								tag={tag}
								onSelect={() => handleSelectTag(tag)}
							/>
						))}
					</div>

					<p className="flex items-center text-xs text-gray-400 mt-1 pl-1">
						<MousePointer className="h-3 w-3 inline mr-1" />
						Click a suggestion to add it
					</p>
				</div>
			)}

			{tagError && (
				<p className="text-[0.8rem] font-medium text-destructive">{tagError}</p>
			)}

			{tags.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-gray-500">My tags:</p>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag, index) => (
							<TagBadge
								key={`${tag.name}-${tag.color}`}
								tag={tag}
								onRemove={() => removeTag(index)}
							/>
						))}
					</div>
				</div>
			)}

			{tags.length >= maxTags && (
				<p className="text-sm text-amber-600">
					Maximum of {maxTags} tags reached
				</p>
			)}

			{error && (
				<p className="text-[0.8rem] font-medium text-destructive">{error}</p>
			)}

			<div className="flex justify-between items-center">
				<p className="text-xs text-gray-500">
					{tags.length}/{maxTags} tags
				</p>
				<p className="text-xs text-gray-400">
					<Shuffle className="h-3 w-3 inline mr-1" />
					Click shuffle for random color
				</p>
			</div>
		</div>
	)
}
