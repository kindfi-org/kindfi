import Image from 'next/image'
import { useState } from 'react'
import type React from 'react'
import { FaBullseye, FaCheckCircle, FaGlobe, FaUsers } from 'react-icons/fa'
import AboutProject from '~/components/sections/project/about-project'
import SectionContainer from '~/components/sections/project/section-container'
import {
	aboutProjectProps,
	successGalleryItems,
} from '~/lib/mock-data/mock-projects'

interface MediaItem {
	id: string
	src: string
	alt: string
}

type IconKey = 'target' | 'user' | 'language' | 'status'

const ICONS: Record<IconKey, React.JSX.Element> = {
	target: <FaBullseye color="#4F46E5" aria-hidden="true" />,
	user: <FaUsers color="#4F46E5" aria-hidden="true" />,
	language: <FaGlobe color="#4F46E5" aria-hidden="true" />,
	status: <FaCheckCircle color="#4F46E5" aria-hidden="true" />,
}

const ProjectOverview = () => {
	const [mediaList, setMediaList] = useState<MediaItem[]>(successGalleryItems)

	const handleThumbnailClick = (mediaId: string) => {
		const selectedIndex = mediaList.findIndex((item) => item.id === mediaId)
		if (selectedIndex === 0) return

		const currentList = [...mediaList]
		const [selectedImage] = currentList.splice(selectedIndex, 1)
		const reorderedList = [
			selectedImage,
			...currentList.filter((item) => item !== selectedImage),
		]
		setMediaList(reorderedList)
	}

	const handleKeyDown = (mediaId: string) => (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			handleThumbnailClick(mediaId)
		}
	}

	return (
		<SectionContainer>
			<div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-10">
				<div className="absolute inset-4 flex items-center justify-center shadow-lg rounded-lg">
					{mediaList[0] && (
						<Image
							src={mediaList[0].src}
							alt={mediaList[0].alt}
							className="w-full h-full object-cover rounded-lg"
						/>
					)}
				</div>
				<ul
					className="absolute bottom-8 left-8 flex space-x-2"
					aria-label="Project image thumbnails"
				>
					{mediaList.map((item, index) =>
						index > 0 ? (
							<li key={item.id}>
								<button
									type="button"
									onClick={() => handleThumbnailClick(item.id)}
									onKeyDown={handleKeyDown(item.id)}
									className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
									aria-label={`View ${item.alt}`}
								>
									<Image
										src={item.src}
										alt={item.alt}
										aria-hidden="true"
										className="w-24 h-24 rounded object-cover transition-transform transform hover:scale-105 shadow-sm"
									/>
								</button>
							</li>
						) : null,
					)}
				</ul>
			</div>
			<div className="mt-6">
				<AboutProject
					{...aboutProjectProps}
					highlights={aboutProjectProps.highlights.map((highlight) => ({
						...highlight,
						icon: ICONS[highlight.icon as IconKey],
					}))}
				/>
			</div>
		</SectionContainer>
	)
}

export default ProjectOverview
