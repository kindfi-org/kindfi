import { cn } from '~/lib/utils'

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
		highlightWords.forEach((word) => {
			result = result.replace(
				word,
				`<span class="font-bold gradient-text">${word}</span>`,
			)
		})
		// biome-ignore lint/security/noDangerouslySetInnerHtml: any
		return <div dangerouslySetInnerHTML={{ __html: result }} />
	}

	return (
		<div
			className={cn(
				'mx-auto mb-12 text-center max-w-3xl',
				className,
			)}
		>
			<h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem]">
				{highlightText(title)}
			</h2>
			<p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
				{subtitle}
			</p>
		</div>
	)
}
