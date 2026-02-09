'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ImageIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '~/components/base/card'

interface NFTMetadata {
	name: string
	description: string
	image_uri: string
	external_url: string
	attributes: Array<{
		trait_type: string
		value: string
		display_type?: string
		max_value?: string
	}>
}

interface NFT {
	tokenId: number
	owner: string
	metadata: NFTMetadata
}

interface NFTCollectionResponse {
	success: boolean
	data: {
		nfts: NFT[]
		total: number
	}
}

export function NFTCollection() {
	const { data: session } = useSession()
	const smartAccountAddress =
		session?.device?.address || session?.user?.device?.address

	const { data, isLoading, error } = useQuery<NFTCollectionResponse>({
		queryKey: ['nfts', smartAccountAddress],
		queryFn: async () => {
			if (!smartAccountAddress) {
				throw new Error('No smart account address')
			}

			const response = await fetch(`/api/nfts/${smartAccountAddress}`)
			if (!response.ok) {
				throw new Error('Failed to fetch NFTs')
			}
			return response.json()
		},
		enabled: !!smartAccountAddress,
	})

	if (!smartAccountAddress) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
				<p>Connect your wallet to view your NFT collection</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p>Loading NFTs...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center py-12 text-red-600">
				<p>Failed to load NFTs. Please try again later.</p>
			</div>
		)
	}

	const nfts = data?.data?.nfts || []

	if (nfts.length === 0) {
		return (
			<div className="text-center py-12">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
				>
					<Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
					<h3 className="text-lg font-semibold mb-2">No NFTs Yet</h3>
					<p className="text-muted-foreground mb-4">
						Complete quests, maintain streaks, and refer friends to earn NFTs!
					</p>
				</motion.div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Your Collection</h3>
					<p className="text-sm text-muted-foreground">
						{nfts.length} {nfts.length === 1 ? 'NFT' : 'NFTs'}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{nfts.map((nft, index) => (
					<motion.div
						key={nft.tokenId}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="group cursor-pointer transition-all hover:shadow-lg overflow-hidden">
							<div className="relative h-48 bg-muted overflow-hidden">
								{nft.metadata.image_uri ? (
									<Image
										src={nft.metadata.image_uri}
										alt={nft.metadata.name}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-110"
									/>
								) : (
									<div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10">
										<ImageIcon className="h-12 w-12 text-muted-foreground" />
									</div>
								)}
								<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
									#{nft.tokenId.toString().padStart(4, '0')}
								</div>
							</div>
							<CardContent className="p-4">
								<h4 className="font-semibold mb-1 line-clamp-1">
									{nft.metadata.name}
								</h4>
								{nft.metadata.description && (
									<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
										{nft.metadata.description}
									</p>
								)}
								{nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{nft.metadata.attributes.slice(0, 3).map((attr, idx) => (
											<span
												key={idx}
												className="text-xs bg-muted px-2 py-1 rounded"
											>
												{attr.trait_type}: {attr.value}
											</span>
										))}
										{nft.metadata.attributes.length > 3 && (
											<span className="text-xs text-muted-foreground">
												+{nft.metadata.attributes.length - 3} more
											</span>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</div>
	)
}
