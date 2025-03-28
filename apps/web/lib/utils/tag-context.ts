'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { Tag } from '../types'

// Predefined list of accessible color combinations (background and text)
const ACCESSIBLE_COLORS = [
	{ bg: '#e9d8fd', text: '#44337a' },
	{ bg: '#faf089', text: '#744210' },
	{ bg: '#c6f6d5', text: '#22543d' },
	{ bg: '#fed7d7', text: '#822727' },
	{ bg: '#e6fffa', text: '#234e52' },
	{ bg: '#feebc8', text: '#7b341e' },
	{ bg: '#e1effe', text: '#2c5282' },
	{ bg: '#fefcbf', text: '#723b13' },
	{ bg: '#fed7e2', text: '#702459' },
	{ bg: '#e2e8f0', text: '#2d3748' },
	{ bg: '#d1e8ff', text: '#1a365d' },
	{ bg: '#fcd5ce', text: '#7b341e' },
	{ bg: '#d3f9d8', text: '#22543d' },
	{ bg: '#ffc6ff', text: '#702459' },
	{ bg: '#b3e5fc', text: '#01579b' },
]

export function formatToPascalCase(input: string): string {
	return input
		.split(/[\s-_]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('')
}

export function getRandomAccessibleColor(): {
	backgroundColor: string
	textColor: string
} {
	const randomIndex = Math.floor(Math.random() * ACCESSIBLE_COLORS.length)
	return {
		backgroundColor: ACCESSIBLE_COLORS[randomIndex].bg,
		textColor: ACCESSIBLE_COLORS[randomIndex].text,
	}
}

export function useTags() {
	const [tags, setTags] = useState<Tag[]>([])

	const addTag = useCallback(
		(tagName: string) => {
			const formattedTag = formatToPascalCase(tagName)
			if (!tags.some((tag) => tag.text === formattedTag)) {
				const { backgroundColor, textColor } = getRandomAccessibleColor()
				setTags((prevTags) => [
					...prevTags,
					{
						id: crypto.randomUUID(),
						text: formattedTag,
						color: { backgroundColor, textColor },
					},
				])
			}
		},
		[tags],
	)

	const removeTag = useCallback((tagId: string) => {
		setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId))
		toast.info('Tag removed')
	}, [])

	const updateTag = useCallback(
		(tagId: string, newTagName: string) => {
			const formattedNewTag = formatToPascalCase(newTagName)
			if (
				!tags.some((tag) => tag.id !== tagId && tag.text === formattedNewTag)
			) {
				setTags((prevTags) =>
					prevTags.map((tag) =>
						tag.id === tagId ? { ...tag, text: formattedNewTag } : tag,
					),
				)
			}
		},
		[tags],
	)

	return { tags, addTag, removeTag, updateTag }
}
