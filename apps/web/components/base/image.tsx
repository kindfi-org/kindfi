import type { FC, ImgHTMLAttributes } from 'react'
import { cn } from '~/lib/utils'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	src: string
	alt: string
	className?: string
}

const Image: FC<ImageProps> = ({ src, alt, className, ...props }) => {
	return (
		<div
			className={cn(
				'w-full h-full flex items-center justify-center overflow-hidden',
				className,
			)}
		>
			<img
				src={src}
				alt={alt}
				className="w-full h-full object-cover block m-0 p-0"
				loading="lazy"
				{...props}
				aria-label="image"
			/>
		</div>
	)
}

export default Image
