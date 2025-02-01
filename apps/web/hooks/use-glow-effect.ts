'use client'

import { useEffect, useRef } from 'react'

export function useGlowEffect() {
	const cardRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const card = cardRef.current
		if (!card) return

		const handleMouseMove = (event: MouseEvent) => {
			const rect = card.getBoundingClientRect()
			const x = event.clientX - rect.left
			const y = event.clientY - rect.top

			card.style.setProperty('--xPos', `${x}px`)
			card.style.setProperty('--yPos', `${y}px`)
		}

		card.addEventListener('mousemove', handleMouseMove)

		return () => {
			card.removeEventListener('mousemove', handleMouseMove)
		}
	}, [])

	return cardRef
}
