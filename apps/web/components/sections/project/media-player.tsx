import { useState } from 'react'
import type React from 'react'
import { Button } from '~/components/base/button'

type MediaItem = {
	id: string
	type: 'image' | 'video'
	src: `.mp4` | `.jpg` | `.png` | `.webp`
	alt: string
}

type MediaPlayerProps = {
	items: MediaItem[]
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ items }) => {
	const [activeIndex, setActiveIndex] = useState(0)

	const activeItem = items[activeIndex]

	return (
		<div className="media-player flex flex-col items-center space-y-4">
			<div className="main-media w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
				{activeItem.type === 'image' ? (
					<img
						src={activeItem.src}
						alt={activeItem.alt || 'Media item'}
						className="h-full object-contain"
					/>
				) : (
					<video
						src={activeItem.src}
						controls
						className="h-full object-contain"
					>
						Your browser does not support the video tag.
					</video>
				)}
			</div>

			<div className="thumbnails flex space-x-2">
				{items.map((item, index) => (
					<Button
						key={item.id}
						type="button"
						onClick={() => setActiveIndex(index)}
						className={`thumbnail w-16 h-16 border-2 rounded-md overflow-hidden flex items-center justify-center ${
							activeIndex === index
								? 'border-blue-500'
								: 'border-gray-300 hover:border-gray-400'
						}`}
					>
						{item.type === 'image' ? (
							<img
								src={item.src}
								alt={item.alt || 'Thumbnail'}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="text-gray-500 flex items-center justify-center w-full h-full">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M14.752 11.168l-6.88-3.94A1 1 0 007 8.083v7.834a1 1 0 001.872.555l6.88-3.94a1 1 0 000-1.667z"
									/>
								</svg>
							</div>
						)}
					</Button>
				))}
			</div>
		</div>
	)
}

export default MediaPlayer
