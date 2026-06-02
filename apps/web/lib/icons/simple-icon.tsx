import type { ComponentProps } from 'react'
import type { SimpleIcon } from 'simple-icons'

type SimpleIconSvgProps = Omit<ComponentProps<'svg'>, 'children'> & {
	icon: SimpleIcon
	title?: string
}

export const SimpleIconSvg = ({ icon, title, className, ...props }: SimpleIconSvgProps) => {
	const label = title ?? icon.title

	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label={label}
			{...props}
		>
			<title>{label}</title>
			<path d={icon.path} fill="currentColor" />
		</svg>
	)
}
