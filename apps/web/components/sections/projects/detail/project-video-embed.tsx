'use client'

import { transformToEmbedUrl } from '~/lib/utils/video-embed'

interface ProjectVideoEmbedProps {
	url: string
	title?: string
	className?: string
}

/**
 * Renders an embedded project pitch video (YouTube, Vimeo, or Loom).
 * Accepts share/watch or embed URLs and normalizes them for iframe playback.
 */
export const ProjectVideoEmbed = ({
	url,
	title = 'Project Video',
	className = 'w-full h-full',
}: ProjectVideoEmbedProps) => {
	const embedUrl = transformToEmbedUrl(url)

	return (
		<iframe
			src={embedUrl}
			title={title}
			className={className}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
			allowFullScreen
			referrerPolicy="strict-origin-when-cross-origin"
			// Scripts + presentation for players; popups for provider overlays (e.g. Loom)
			sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox"
			loading="lazy"
		/>
	)
}
