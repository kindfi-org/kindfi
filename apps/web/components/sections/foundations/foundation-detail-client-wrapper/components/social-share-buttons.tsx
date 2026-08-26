'use client'

import { Link as LinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { FacebookIcon, LinkedinIcon, XIcon } from '~/lib/icons/social-icons'
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
				<XIcon className="h-4 w-4" aria-hidden="true" />
				<span>X</span>
			</a>
			<a
				href={shareData.facebook}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on Facebook"
			>
				<FacebookIcon className="h-4 w-4" aria-hidden="true" />
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
