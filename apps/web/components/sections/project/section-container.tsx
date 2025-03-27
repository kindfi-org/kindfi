import type React from 'react'

/**
 * Props for the SectionContainer component
 * @property {string} [title] - Optional title to display at the top of the section
 * @property {React.ReactNode} children - Content to be rendered inside the section
 */
interface SectionContainerProps {
	title?: string
	children: React.ReactNode
}

const SectionContainer: React.FC<SectionContainerProps> = ({
	title,
	children,
}) => {
	return (
		<div className="section-container">
			{title && (
				<h1 className="section-title text-xl font-bold mb-4 text-black">
					{title}
				</h1>
			)}
			<div className="section-content">{children}</div>
		</div>
	)
}

export { SectionContainer }
