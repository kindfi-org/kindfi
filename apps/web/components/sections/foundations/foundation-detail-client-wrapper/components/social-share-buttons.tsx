'use client'

import { LinkedinIcon, Link as LinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { shareActionClass } from '../constants'

interface SocialShareButtonsProps {
	url: string
	title: string
	description?: string
}

export function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
	const shareData = useMemo(() => {
		const encodedUrl = encodeURIComponent(url)
		const encodedTitle = encodeURIComponent(title)
		const encodedDesc = encodeURIComponent(description || '')

		return {
			twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${encodedDesc ? `&description=${encodedDesc}` : ''}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
		}
	}, [url, title, description])

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url)
			toast.success('Link copied to clipboard!')
		} catch {
			toast.error('Failed to copy link')
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<a
				href={shareData.twitter}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on X (Twitter)"
			>
				<svg
					role="img"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<title>X</title>
					<path
						fill="currentColor"
						d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
					/>
				</svg>
				<span>X</span>
			</a>
			<a
				href={shareData.facebook}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on Facebook"
			>
				<svg
					role="img"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<title>Facebook</title>
					<path
						fill="currentColor"
						d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
					/>
				</svg>
				<span>Facebook</span>
			</a>
			<a
				href={shareData.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on LinkedIn"
			>
				<LinkedinIcon className="h-4 w-4" aria-hidden="true" />
				<span>LinkedIn</span>
			</a>
			<button
				type="button"
				onClick={handleCopyLink}
				className={shareActionClass}
				aria-label="Copy link to clipboard"
			>
				<LinkIcon className="h-4 w-4" aria-hidden="true" />
				<span>Copy Link</span>
			</button>
		</div>
	)
}
