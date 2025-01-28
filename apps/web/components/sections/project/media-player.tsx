import { useState } from 'react'
import type React from 'react'
import { Button } from '~/components/base/button'

type MediaItem = {
	id: string
	type: 'image' | 'video'
	src: `.mp4` | `.jpg` | `.png` | `.webp`
	alt: string
	caption?: string
}

type MediaPlayerProps = {
	items: MediaItem[]
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ items }) => {
	const [activeIndex, setActiveIndex] = useState(0)

	const activeItem = items[activeIndex]
	const videoFileName = activeItem.src
		.split('/')
		.pop()
		?.replace(/\.[^/.]+$/, '')

	return (
		<div
			className="media-player flex flex-col items-center space-y-4"
			aria-label="Media gallery"
		>
			<div className="main-media w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
				{activeItem.type === 'image' ? (
					<img
						src={activeItem.src}
						alt={activeItem.alt || 'Media item'}
						className="h-full object-contain"
					/>
				) : (
					<div className="video-container relative w-full h-full">
						<video
							src={activeItem.src}
							controls
							className="h-full object-contain"
							aria-label={activeItem.alt}
						>
							<track
								kind="captions"
								src={`/captions/${videoFileName}.vtt`}
								srcLang="en"
								label="English"
								default
							/>
							{activeItem.caption && (
								<track
									kind="descriptions"
									src={`/descriptions/${videoFileName}.vtt`}
									srcLang="en"
									label="English descriptions"
								/>
							)}
							Your browser does not support the video tag.
						</video>
						{activeItem.caption && (
							<div className="caption-text absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
								{activeItem.caption}
							</div>
						)}
					</div>
				)}
			</div>

			<div
				className="thumbnails flex space-x-2"
				role="tablist"
				aria-label="Media thumbnails"
			>
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
						aria-selected={activeIndex === index}
						aria-label={`View ${item.alt}`}
						role="tab"
					>
						{item.type === 'image' ? (
							<img
								src={item.src}
								alt=""
								aria-hidden="true"
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
									role="img"
									aria-label="Video thumbnail"
								>
									<title>Video thumbnail</title>
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
