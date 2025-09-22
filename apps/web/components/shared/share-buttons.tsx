'use client'

import { LinkedinIcon, Link as LinkIcon } from 'lucide-react'
import { Button } from '~/components/base/button'

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
				<Button variant="outline" size="sm" className="gap-2">
					<span
						className="h-4 w-4 inline-block align-middle"
						aria-hidden="true"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
						>
							<title>X</title>
							<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
						</svg>
					</span>
					Share
				</Button>
			</a>
			<a href={linkedinHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gap-2">
					<LinkedinIcon className="h-4 w-4" /> Share
				</Button>
			</a>
			<a href={facebookHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm">
					Facebook
				</Button>
			</a>
			<Button
				variant="ghost"
				size="sm"
				className="gap-2"
				onClick={copyToClipboard}
			>
				<LinkIcon className="h-4 w-4" /> Copy link
			</Button>
		</div>
	)
}
