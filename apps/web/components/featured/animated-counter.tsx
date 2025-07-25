'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
	value: number
	duration?: number
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
	value,
	duration = 2000,
}) => {
	const [count, setCount] = useState(0)
	const _countRef = useRef<number | null>(null)

	useEffect(() => {
		let startTime: number
		let animationFrame: number

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp
			const progress = timestamp - startTime

			if (progress < duration) {
				setCount(Math.min(Math.floor((progress / duration) * value), value))
				animationFrame = requestAnimationFrame(animate)
			} else {
				setCount(value)
			}
		}

		animationFrame = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(animationFrame)
	}, [value, duration])

	return <span>{count.toLocaleString()}</span>
}
