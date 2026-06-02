'use client'

import { Link as LinkIcon } from 'lucide-react'
import { Button } from '~/components/base/button'
import { FacebookIcon, LinkedinIcon, XIcon } from '~/lib/icons/social-icons'

interface ShareButtonsProps {
	url: string
	title: string
	description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
	const encodedUrl = encodeURIComponent(url)
	const encodedTitle = encodeURIComponent(title)
	const encodedDesc = encodeURIComponent(description || '')

	const twitterHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
	const linkedinHref = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`
	const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

	function copyToClipboard() {
		navigator.clipboard?.writeText(url).catch(() => {})
	}

	return (
		<div className="flex items-center gap-2">
			<a href={twitterHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<XIcon className="h-4 w-4" aria-hidden="true" />
					Share
				</Button>
			</a>
			<a href={linkedinHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<LinkedinIcon className="h-4 w-4" /> Share
				</Button>
			</a>
			<a href={facebookHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<FacebookIcon className="h-4 w-4" aria-hidden="true" />
					Facebook
				</Button>
			</a>
			<Button variant="ghost" size="sm" className="gap-2" onClick={copyToClipboard}>
				<LinkIcon className="h-4 w-4" /> Copy link
			</Button>
		</div>
	)
}
