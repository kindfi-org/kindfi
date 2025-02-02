import Image from 'next/image'
import { useState } from 'react'
import type React from 'react'
import SectionContainer from '~/components/sections/project/section-container'
import SuccessGallery from '~/components/sections/project/success-gallery'
import { showcaseData } from '~/lib/mock-data/mock-projects'

interface MediaItem {
	src: string
	type: 'image' | 'video'
	alt: string
}

const ProjectShowcaseSection = () => {
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

	// Fix: Accepts MediaItem and index to match expected type
	const openLightbox = (index: number) => {
		const item = showcaseData[index]
		if (!item) return

		setSelectedMedia(item)
		setLightboxOpen(true)
	}

	const closeLightbox = () => {
		setSelectedMedia(null)
		setLightboxOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeLightbox()
		}
	}

	return (
		<SectionContainer>
			<SuccessGallery items={showcaseData} onMediaClick={openLightbox} />

			{lightboxOpen && selectedMedia && (
				<dialog
					open
					aria-modal="true"
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onKeyDown={handleKeyDown}
				>
					<div className="relative max-w-4xl max-h-screen p-4">
						<button
							type="button"
							onClick={closeLightbox}
							className="absolute top-4 right-4 text-white text-2xl font-bold p-2"
							aria-label="Close lightbox"
						>
							&times;
						</button>

						{selectedMedia.type === 'image' ? (
							<Image
								src={selectedMedia.src}
								alt={selectedMedia.alt || 'Showcase image'}
								className="max-w-full max-h-full rounded-lg"
								width={800}
								height={600}
							/>
						) : (
							<video
								src={selectedMedia.src}
								controls
								className="max-w-full max-h-full rounded-lg"
								aria-label="Showcase video"
							>
								<track
									kind="captions"
									src={`/captions/${selectedMedia.src
										.split('/')
										.pop()
										?.replace(/\.[^/.]+$/, '')}.vtt`}
									label="English"
									srcLang="en"
									default
								/>
								Your browser does not support the video tag.
							</video>
						)}
					</div>
				</dialog>
			)}
		</SectionContainer>
	)
}

export default ProjectShowcaseSection
