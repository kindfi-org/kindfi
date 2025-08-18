import { useEffect, useMemo, useState } from 'react'

interface UseTypewriterOptions {
	typingSpeedMs?: number
	deletingSpeedMs?: number
	fullWordPauseMs?: number
	emptyPauseMs?: number
	order?: 'sequential' | 'random'
	startIndex?: number
	loop?: boolean
}

interface UseTypewriterReturn {
	displayText: string
	wordIndex: number
	isDeleting: boolean
	longestWordCh: number
}

export function useTypewriter(
	words: string[],
	options?: UseTypewriterOptions,
): UseTypewriterReturn {
	const {
		typingSpeedMs = 120,
		deletingSpeedMs = 70,
		fullWordPauseMs = 1200,
		emptyPauseMs = 400,
		order = 'sequential',
		startIndex = 0,
		loop = true,
	} = options || {}

	const [wordIndex, setWordIndex] = useState(startIndex)
	const [displayText, setDisplayText] = useState(words[startIndex] ?? '')
	const [isDeleting, setIsDeleting] = useState(false)

	const longestWordCh = useMemo(
		() => Math.max(0, ...words.map((w) => w.length)),
		[words],
	)

	useEffect(() => {
		if (!Array.isArray(words) || words.length === 0) return

		const currentWord = words[wordIndex] ?? ''

		let timeout: ReturnType<typeof setTimeout> | undefined

		if (isDeleting) {
			if (displayText.length > 0) {
				timeout = setTimeout(
					() => setDisplayText((t) => t.slice(0, -1)),
					deletingSpeedMs,
				)
			} else {
				const nextIndex = getNextIndex(wordIndex, words.length, order)

				timeout = setTimeout(() => {
					if (!loop && nextIndex === 0) return
					setIsDeleting(false)
					setWordIndex(nextIndex)
					setDisplayText((words[nextIndex] ?? '').slice(0, 1))
				}, emptyPauseMs)
			}
		} else {
			if (displayText === currentWord) {
				timeout = setTimeout(() => setIsDeleting(true), fullWordPauseMs)
			} else {
				const next = currentWord.slice(0, displayText.length + 1)
				timeout = setTimeout(() => setDisplayText(next), typingSpeedMs)
			}
		}

		return () => {
			if (timeout) clearTimeout(timeout)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		displayText,
		isDeleting,
		wordIndex,
		words,
		order,
		loop,
		typingSpeedMs,
		deletingSpeedMs,
		fullWordPauseMs,
		emptyPauseMs,
	])

	return { displayText, wordIndex, isDeleting, longestWordCh }
}

function getNextIndex(
	currentIndex: number,
	length: number,
	order: 'sequential' | 'random',
): number {
	if (order === 'random') {
		if (length <= 1) return 0
		let next = currentIndex
		while (next === currentIndex) {
			next = Math.floor(Math.random() * length)
		}
		return next
	}
	return (currentIndex + 1) % length
}
