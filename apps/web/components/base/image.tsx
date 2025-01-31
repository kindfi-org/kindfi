import type { FC, ImgHTMLAttributes } from 'react'
import { cn } from '~/lib/utils'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	src: string
	alt?: string
	className?: string
	isDecorative?: boolean
}

const Image: FC<ImageProps> = ({
	src,
	alt,
	className,
	isDecorative = false,
	...props
}) => {
	return (
		<div
			className={cn(
				'w-full h-full flex items-center justify-center overflow-hidden',
				className,
			)}
		>
			<Image
				src={src}
				alt={isDecorative ? '' : alt || 'Image'}
				aria-hidden={isDecorative}
				className="w-full h-full object-cover block m-0 p-0"
				loading="lazy"
				{...props}
				aria-label="image"
			/>
		</div>
	)
}

export default Image
