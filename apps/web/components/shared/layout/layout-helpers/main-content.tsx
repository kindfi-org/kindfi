import type React from 'react'

interface MainContentProps {
	children: React.ReactNode
	className?: string
	containerType?: 'full' | 'contained'
}

export const MainContent = ({
	children,
	className = '',
	containerType = 'full',
}: MainContentProps) => {
	return (
		<main
			className={`
        ${containerType === 'full' ? 'w-full' : 'container'}
        mx-auto
        ${className}
      `}
		>
			{children}
		</main>
	)
}
