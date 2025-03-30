'use client'
import { Play } from 'lucide-react'
import type React from 'react'
import { useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { twMerge } from 'tailwind-merge'
import type { ClassNameValue } from 'tailwind-merge'

type ProjectVideoProps = {
	url: string
	fallbackImage?: string
	controls?: boolean
	loop?: boolean
	muted?: boolean
	width?: string
	height?: string
	className?: ClassNameValue
	videoClassName?: ClassNameValue
}

const ProjectVideo: React.FC<ProjectVideoProps> = ({
	url,
	fallbackImage = '/fallback-thumbnail.jpg',
	controls = true,
	loop = false,
	muted = false,
	width = '100%',
	height = 'auto',
	className = '',
	videoClassName = '',
}) => {
	const [videoError, setVideoError] = useState(false)
	const [playing, setPlaying] = useState(false)
	const playerRef = useRef<ReactPlayer>(null)

	const togglePlay = () => {
		setPlaying((prev) => !prev)
	}
	const handleKeyDown = (e: React.KeyboardEvent) => {
	if (e.key === ' ' || e.key === 'Enter') {
		e.preventDefault()
				togglePlay()
	}
		}

	return (
		<div className={twMerge('rounded-lg overflow-hidden', className)}>
			{videoError || !url ? (
				<>
					<div className="w-auto bg-[#0000004d] h-full rounded-lg inset-0 absolute" />
					<img
						src={fallbackImage}
						alt="Fallback Thumbnail"
						className="w-full h-auto object-cover rounded-lg"
					/>
				</>
			) : (
				<div className="relative">
					<ReactPlayer
						ref={playerRef}
						url={url}
						controls={controls}
						playing={playing}
						loop={loop}
						muted={muted}
						width={width}
						height={height}
						onError={() => setVideoError(true)}
						onClick={togglePlay}
						className={twMerge('rounded-lg overflow-hidden', videoClassName)}
					/>
					{!playing && (
						<button
						aria-label="Play video"
						onKeyDown={handleKeyDown}
						tabIndex={0}
							type="button"
							className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-2"
							onClick={togglePlay}
						>
							<div className="w-[50px] h-[50px] rounded-full flex items-center justify-center bg-blue-700">
								<Play size={13} color="white" />
							</div>
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default ProjectVideo
