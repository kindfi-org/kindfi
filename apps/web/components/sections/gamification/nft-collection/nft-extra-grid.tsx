'use client'

import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '~/components/base/card'
import type { NFT } from './types'

export function NftExtraGrid({ nfts }: { nfts: NFT[] }) {
	if (nfts.length <= 1) {
		return null
	}

	return (
		<>
			<h4 className="text-sm font-semibold text-muted-foreground mt-6">
				Other NFTs ({nfts.length - 1})
			</h4>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{nfts.slice(1).map((extra) => (
					<Card
						key={extra.tokenId}
						className="overflow-hidden hover:shadow-md transition-shadow"
					>
						<div className="relative h-40 bg-muted">
							{extra.metadata.image_uri ? (
								<Image
									src={extra.metadata.image_uri}
									alt={extra.metadata.name}
									fill
									className="object-cover"
									unoptimized
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<ImageIcon className="h-10 w-10 text-muted-foreground" />
								</div>
							)}
							<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
								#{extra.tokenId.toString().padStart(4, '0')}
							</div>
						</div>
						<CardContent className="p-3">
							<h4 className="font-medium text-sm line-clamp-1">
								{extra.metadata.name}
							</h4>
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)
}
