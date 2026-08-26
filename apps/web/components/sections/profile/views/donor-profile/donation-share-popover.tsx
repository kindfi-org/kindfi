'use client'

import { Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '~/components/base/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/base/popover'
import { ShareButtons } from '~/components/shared/share-buttons'
import { getDonationShareContent } from '~/lib/seo/donation-share'
import { cn } from '~/lib/utils'

interface DonationSharePopoverProps {
	projectTitle: string
	projectSlug: string | null
	projectDescription?: string | null
	contributionAmount?: number
	shareLabel: string
	className?: string
	variant?: 'default' | 'outline' | 'ghost'
	size?: 'default' | 'sm' | 'icon'
	fullWidth?: boolean
}

export const DonationSharePopover = ({
	projectTitle,
	projectSlug,
	projectDescription,
	contributionAmount,
	shareLabel,
	className,
	variant = 'outline',
	size = 'sm',
	fullWidth = false,
}: DonationSharePopoverProps) => {
	const shareContent = useMemo(
		() =>
			projectSlug
				? getDonationShareContent({
						projectTitle,
						projectSlug,
						projectDescription,
						contributionAmount,
					})
				: null,
		[projectTitle, projectSlug, projectDescription, contributionAmount],
	)

	if (!shareContent) {
		return null
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant={variant}
					size={size}
					className={cn(fullWidth && 'w-full', size === 'icon' ? '' : 'gap-2', className)}
					aria-label={shareLabel}
				>
					<Share2 className="h-4 w-4" aria-hidden="true" />
					{size !== 'icon' ? <span>{shareLabel}</span> : null}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-auto max-w-sm space-y-3 p-4">
				<p className="text-sm font-medium text-foreground">{shareLabel}</p>
				<ShareButtons
					url={shareContent.url}
					title={shareContent.title}
					description={shareContent.description}
					variant="pill"
				/>
			</PopoverContent>
		</Popover>
	)
}
