'use client'

import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
	value: number
	duration?: number
}

export function AnimatedCounter({
	value,
	duration = 1000,
}: AnimatedCounterProps) {
	const [count, setCount] = useState(0)
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true })
	const startTime = useRef<number | null>(null)
	const animationFrameId = useRef<number | null>(null)

	useEffect(() => {
		if (!isInView) return

		const animate = (timestamp: number) => {
			if (!startTime.current) startTime.current = timestamp
			const progress = timestamp - startTime.current

			const progressRatio = Math.min(progress / duration, 1)
			const currentCount = Math.floor(progressRatio * value)
			setCount(currentCount)

			if (progressRatio < 1) {
				animationFrameId.current = requestAnimationFrame(animate)
			} else {
				setCount(value) // Ensure we end at the exact value
			}
		}

		animationFrameId.current = requestAnimationFrame(animate)

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current)
			}
		}
	}, [isInView, value, duration])

	return <span ref={ref}>{count.toLocaleString()}</span>
}
