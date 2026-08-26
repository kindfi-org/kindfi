'use client'

import { Link as LinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { FacebookIcon, LinkedinIcon, XIcon } from '~/lib/icons/social-icons'
import { cn } from '~/lib/utils'

interface ShareButtonsProps {
	url: string
	title: string
	description?: string
	variant?: 'default' | 'pill'
	className?: string
}

const pillActionClass =
	'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function ShareButtons({
	url,
	title,
	description,
	variant = 'default',
	className,
}: ShareButtonsProps) {
	const shareLinks = useMemo(() => {
		const encodedUrl = encodeURIComponent(url)
		const encodedTitle = encodeURIComponent(title)
		const encodedDesc = encodeURIComponent(description || '')
		const whatsappText = encodeURIComponent(
			description ? `${title} — ${description} ${url}` : `${title} ${url}`,
		)

		return {
			twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
			whatsapp: `https://wa.me/?text=${whatsappText}`,
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

	if (variant === 'pill') {
		return (
			<div className={cn('flex flex-wrap items-center gap-2', className)}>
				<a
					href={shareLinks.twitter}
					target="_blank"
					rel="noopener noreferrer"
					className={pillActionClass}
					aria-label="Share on X (Twitter)"
				>
					<XIcon className="h-4 w-4" aria-hidden="true" />
					<span>X</span>
				</a>
				<a
					href={shareLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					className={pillActionClass}
					aria-label="Share on Facebook"
				>
					<FacebookIcon className="h-4 w-4" aria-hidden="true" />
					<span>Facebook</span>
				</a>
				<a
					href={shareLinks.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					className={pillActionClass}
					aria-label="Share on LinkedIn"
				>
					<LinkedinIcon className="h-4 w-4" aria-hidden="true" />
					<span>LinkedIn</span>
				</a>
				<a
					href={shareLinks.whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					className={pillActionClass}
					aria-label="Share on WhatsApp"
				>
					<span aria-hidden="true">💬</span>
					<span>WhatsApp</span>
				</a>
				<button
					type="button"
					onClick={handleCopyLink}
					className={pillActionClass}
					aria-label="Copy link to clipboard"
				>
					<LinkIcon className="h-4 w-4" aria-hidden="true" />
					<span>Copy link</span>
				</button>
			</div>
		)
	}

	return (
		<div className={cn('flex flex-wrap items-center gap-2', className)}>
			<a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<XIcon className="h-4 w-4" aria-hidden="true" />X
				</Button>
			</a>
			<a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<LinkedinIcon className="h-4 w-4" aria-hidden="true" />
					LinkedIn
				</Button>
			</a>
			<a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					<FacebookIcon className="h-4 w-4" aria-hidden="true" />
					Facebook
				</Button>
			</a>
			<a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" size="sm" className="gradient-border-btn gap-2 bg-white">
					WhatsApp
				</Button>
			</a>
			<Button variant="ghost" size="sm" className="gap-2" onClick={handleCopyLink}>
				<LinkIcon className="h-4 w-4" aria-hidden="true" />
				Copy link
			</Button>
		</div>
	)
}
