'use client'

import { Globe } from 'lucide-react'
import Image from 'next/image'
import { Button } from '~/components/base/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import type { SocialLinks } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { getSocialTypeFromUrl, isValidUrl } from '~/lib/utils/project-utils'

interface SocialLinksDisplayProps {
	socialLinks: SocialLinks
	className?: string
}

interface SocialLinkConfig {
	label: string
}

const socialConfigs: Record<string, SocialLinkConfig> = {
	website: { label: 'Website' },
	twitter: { label: 'Twitter/X' },
	facebook: { label: 'Facebook' },
	instagram: { label: 'Instagram' },
	linkedin: { label: 'LinkedIn' },
	github: { label: 'GitHub' },
	youtube: { label: 'YouTube' },
	telegram: { label: 'Telegram' },
	discord: { label: 'Discord' },
	medium: { label: 'Medium' },
	tiktok: { label: 'TikTok' },
}

export function SocialLinksDisplay({
	socialLinks,
	className = '',
}: SocialLinksDisplayProps) {
	const validLinks = Object.entries(socialLinks)
		.filter(([_, url]) => url && isValidUrl(url))
		.map(([key, url]) => {
			const socialType = getSocialTypeFromUrl(url) || key
			const config = socialConfigs[socialType] || socialConfigs.website

			return {
				key: socialType,
				url,
				label: config.label,
			}
		})

	if (validLinks.length === 0) return null

	return (
		<div
			className={cn(
				'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full',
				className,
			)}
		>
			<span className="text-sm text-muted-foreground font-medium shrink-0">
				Connect with us:
			</span>
			<TooltipProvider>
				<div className="flex flex-wrap items-center gap-2">
					{validLinks.map(({ key, url, label }) => (
						<Tooltip key={key}>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
									aria-label={`Visit ${label}`}
									asChild
								>
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={label}
									>
										{key === 'website' ? (
											<Globe className="h-4 w-4" />
										) : (
											<Image
												src={`/icons/social/${key}.svg`}
												alt={label}
												width={16}
												height={16}
												className="h-4 w-4"
												onError={(e) => {
													e.currentTarget.src = '/icons/social/link.svg'
												}}
											/>
										)}
									</a>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{label}</p>
							</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
		</div>
	)
}
