interface SectionCaptionProps {
	title: string
	subtitle: string
	highlightWords?: string[]
	className?: string
}

export const SectionCaption = ({
	title,
	subtitle,
	highlightWords = [],
	className = '',
}: SectionCaptionProps) => {
	const highlightText = (text: string) => {
		let result = text
		// biome-ignore lint/complexity/noForEach: <explanation>
		highlightWords.forEach((word) => {
			result = result.replace(
				word,
				`<span class="font-bold gradient-text">${word}</span>`,
			)
		})
		// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
		return <div dangerouslySetInnerHTML={{ __html: result }} />
	}

	return (
		<div className={`mx-auto mb-12 max-w-3xl text-center ${className}`}>
			<h2 className="mb-4 text-3xl font-semibold md:text-4xl">
				{highlightText(title)}
			</h2>
			<p className="text-gray-600">{subtitle}</p>
		</div>
	)
}
