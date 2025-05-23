'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'

interface LikeButtonProps {
	initialCount: number
	onLike?: (liked: boolean) => void
}

export function LikeButton({ initialCount = 0, onLike }: LikeButtonProps) {
	const [liked, setLiked] = useState(false)
	const [count, setCount] = useState(initialCount)

	const handleLike = () => {
		const newLikedState = !liked
		setLiked(newLikedState)
		setCount((prev) => (newLikedState ? prev + 1 : Math.max(prev - 1, 0)))

		// TODO: Persist like to backend

		if (onLike) {
			onLike(newLikedState)
		}
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className={`flex items-center gap-1 px-2 py-1 h-auto rounded-full ${
				liked
					? 'text-green-600 bg-green-50 hover:bg-green-100'
					: 'text-gray-500 bg-gray-100 hover:bg-gray-200'
			}`}
			onClick={handleLike}
			aria-pressed={liked}
			aria-label={liked ? 'Unlike' : 'Like'}
		>
			<ThumbsUp
				className={`h-3.5 w-3.5 ${liked ? 'fill-green-600' : ''}`}
				aria-hidden="true"
			/>
			<AnimatePresence mode="wait">
				<motion.span
					key={count}
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 5 }}
					transition={{ duration: 0.2 }}
					className="text-xs font-medium"
				>
					{count}
				</motion.span>
			</AnimatePresence>
		</Button>
	)
}
