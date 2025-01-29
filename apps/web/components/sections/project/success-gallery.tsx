import type React from 'react'
import { Button } from '~/components/base/button'
import Image from '~/components/base/image'

type MediaItem = {
	id: string
	type: 'image' | 'video'
	src: string
	alt: string
}

/**
 * Props for the SuccessGallery component
 * @property {Array<{src: string, alt: string}>} items - Array of gallery items
 * @property {Function} [onMediaClick] - Optional callback when an item is clicked
 */
type SuccessGalleryProps = {
	items: MediaItem[]
	onMediaClick: (index: number) => void
}

// Consider adding zod schema for runtime validation
import { z } from 'zod'

export const SuccessGallerySchema = z.object({
	items: z.array(
		z.object({
			src: z.string().url(),
			alt: z.string().min(1),
		}),
	),
	onMediaClick: z.function().args(z.number()).optional(),
})

const SuccessGallery: React.FC<SuccessGalleryProps> = ({
	items,
	onMediaClick,
}) => {
	return (
		<div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
			<h3 className="text-lg font-bold col-span-full">Success Gallery</h3>
			{items.map((item, index) => (
				<Button
					key={item.id}
					type="button"
					className="w-full h-32 overflow-hidden"
					onClick={() => onMediaClick(index)}
				>
					{item.type === 'image' ? (
						<Image
							src={item.src}
							alt={item.alt}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="text-gray-500 flex items-center justify-center w-full h-full">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-10 w-10"
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
	)
}

export default SuccessGallery
