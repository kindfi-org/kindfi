import NextImage, { type ImageProps } from 'next/image'
import type { FC } from 'react'
import { cn } from '~/lib/utils'

interface BaseImageProps extends ImageProps {
	isDecorative?: boolean
}

const Image: FC<BaseImageProps> = ({
	src,
	alt,
	className,
	isDecorative = false,
	...props
}) => {
	return (
		<picture
			className={cn(
				'w-full h-full flex items-center justify-center overflow-hidden',
				className,
			)}
		>
			<NextImage
				{...props}
				className="w-full h-full object-cover block m-0 p-0"
				alt={isDecorative ? '' : alt || 'Image'}
				aria-hidden={isDecorative}
				height={props.height}
				width={props.width}
				loading="lazy"
				src={src}
			/>
		</picture>
	)
}

export { Image }
