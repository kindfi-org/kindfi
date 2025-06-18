import type React from 'react'
import { Button } from '~/components/base/button'
import type { ButtonProps } from '~/components/base/button'

type ButtonIconDetailProps = {
	children: React.ReactNode
	title?: string
} & Omit<ButtonProps, 'size' | 'className'>

export function ButtonIconDetail({
	children,
	title,
	...props
}: ButtonIconDetailProps) {
	return (
		<Button
			className="rounded-full hover:bg-gray-100 text-gray-900 flex-shrink-0"
			size="icon"
			title={title}
			aria-label={title}
			{...props}
		>
			{children}
		</Button>
	)
}
