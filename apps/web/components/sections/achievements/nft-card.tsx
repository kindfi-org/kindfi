'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '~/components/base/card'
import type { NFTCardProps } from '~/lib/types/section'

export function NFTCard({
	id,
	title,
	project,
	imageUrl,
	onClick,
}: NFTCardProps) {
	return (
		<Card
			className="group cursor-pointer transition-all hover:shadow-md"
			onClick={onClick}
		>
			<div className="relative h-40 bg-muted overflow-hidden rounded-t-md">
				<Image
					src={imageUrl || '/images/startup.png'}
					alt={`${title} NFT from ${project}`}
					width={320}
					height={160}
					loading="lazy"
					className="object-cover object-center w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
				/>
				<div className="absolute right-3 bottom-3 grid place-content-center rounded-full bg-black/50 px-2 py-1">
					<span className="text-xs text-white font-medium">
						#{id.padStart(4, '0')}
					</span>
				</div>
			</div>
			<CardContent className="p-3">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h3 className="text-sm font-medium">{title}</h3>
						<p className="text-sm text-muted-foreground">
							Earned from {project}
						</p>
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
				</div>
			</CardContent>
		</Card>
	)
}
