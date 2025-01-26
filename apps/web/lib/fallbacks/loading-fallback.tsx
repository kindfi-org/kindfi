interface LoadingFallbackProps {
	description: string
}

export function LoadingFallback({ description }: LoadingFallbackProps) {
	return (
		<div className="p-4 text-center">
			<p className="text-lg">{description}</p>
			<span className="sr-only">{description}</span>
		</div>
	)
}
