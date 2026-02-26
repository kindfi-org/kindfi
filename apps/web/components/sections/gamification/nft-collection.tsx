'use client'

import { useQuery } from '@tanstack/react-query'
import {
	ArrowUp,
	ChevronDown,
	ChevronUp,
	Diamond,
	ExternalLink,
	ImageIcon,
	Info,
	Sparkles,
	Trophy,
} from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import { getStellarExplorerAddressUrl } from '~/lib/utils/escrow/stellar-explorer'

// ============================================================================
// Types
// ============================================================================

interface NFTAttribute {
	trait_type: string
	value: string
	display_type?: string
	max_value?: string
}

interface NFTMetadata {
	name: string
	description: string
	image_uri: string
	external_url: string
	attributes: NFTAttribute[]
}

interface NFT {
	tokenId: number
	owner: string
	metadata: NFTMetadata
}

interface NFTCollectionResponse {
	success: boolean
	data: { nfts: NFT[]; total: number }
}

interface UserNFTRecord {
	id: string
	user_id: string
	token_id: number
	tier: 'bronze' | 'silver' | 'gold' | 'diamond'
	contract_address: string
	stellar_address: string
	image_ipfs_hash: string | null
	minted_at: string
	evolved_at: string | null
}

interface UserStats {
	impactScore: number
	totalDonations: number
	questsCompleted: number
	streakDays: number
	referralCount: number
}

// ============================================================================
// Tier config (mirrors server-side TIER_CONFIGS)
// ============================================================================

const TIERS = {
	bronze: {
		label: 'Bronze',
		color: 'bg-orange-100 text-orange-700 border-orange-300',
		accent: '#CD7F32',
		minPts: 0,
		nextPts: 100,
		votes: 1,
	},
	silver: {
		label: 'Silver',
		color: 'bg-gray-100 text-gray-700 border-gray-300',
		accent: '#C0C0C0',
		minPts: 100,
		nextPts: 500,
		votes: 3,
	},
	gold: {
		label: 'Gold',
		color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
		accent: '#FFD700',
		minPts: 500,
		nextPts: 2000,
		votes: 5,
	},
	diamond: {
		label: 'Diamond',
		color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
		accent: '#B9F2FF',
		minPts: 2000,
		nextPts: null,
		votes: 10,
	},
} as const

type Tier = keyof typeof TIERS

// ============================================================================
// Component
// ============================================================================

export function NFTCollection() {
	const { data: session } = useSession()
	const [showMetadata, setShowMetadata] = useState(false)
	const smartAccountAddress =
		session?.device?.address || session?.user?.device?.address

	// Fetch the DB record + stats (fast) for tier info and progress
	const { data: userData, isLoading: dbLoading } = useQuery<{
		nft: UserNFTRecord | null
		stats: UserStats
	}>({
		queryKey: ['user-nft-db', session?.user?.id],
		queryFn: async () => {
			const res = await fetch('/api/nfts/user')
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return {
				nft: json.nft ?? null,
				stats: json.stats ?? {
					impactScore: 0,
					totalDonations: 0,
					questsCompleted: 0,
					streakDays: 0,
					referralCount: 0,
				},
			}
		},
		enabled: !!session?.user?.id,
	})

	const dbNft = userData?.nft ?? null
	const userStats = userData?.stats

	// Fetch on-chain NFTs (slower but authoritative)
	const { data: onChainData, isLoading: chainLoading } =
		useQuery<NFTCollectionResponse>({
			queryKey: ['nfts', smartAccountAddress],
			queryFn: async () => {
				if (!smartAccountAddress) throw new Error('No wallet')
				const res = await fetch(`/api/nfts/${smartAccountAddress}`)
				if (!res.ok) throw new Error('Failed to fetch NFTs')
				return res.json()
			},
			enabled: !!smartAccountAddress,
		})

	const isLoading = dbLoading || chainLoading

	// ---- Not connected ----
	if (!smartAccountAddress && !session?.user?.id) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
				<p>Connect your wallet to view your NFT collection</p>
			</div>
		)
	}

	// ---- Loading ----
	if (isLoading) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p>Loading your Kinder NFT...</p>
			</div>
		)
	}

	const nfts = onChainData?.data?.nfts ?? []
	const tier: Tier = (dbNft?.tier as Tier) ?? 'bronze'
	const tierConfig = TIERS[tier]

	// ---- No NFT yet ----
	if (!dbNft && nfts.length === 0) {
		return (
			<div className="text-center py-12">
				<Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
				<h3 className="text-lg font-semibold mb-2">No Kinder NFT Yet</h3>
				<p className="text-muted-foreground mb-2">
					Make your first donation to receive a Bronze Kinder NFT!
				</p>
				<p className="text-xs text-muted-foreground">
					Your NFT evolves as you donate, complete quests, and refer friends.
				</p>
			</div>
		)
	}

	// ---- Has NFT ----
	const nft = nfts[0] // Primary NFT (Kinder)
	const attrs = nft?.metadata?.attributes ?? []
	const impactScoreOnChain = findAttr(attrs, 'Impact Score')
	const donationsOnChain = findAttr(attrs, 'Total Donations')
	const questsOnChain = findAttr(attrs, 'Quests Completed')
	const streaksOnChain = findAttr(attrs, 'Streak Days')
	const referralsOnChain = findAttr(attrs, 'Referrals')
	const govVotes = findAttr(attrs, 'Governance Votes')

	// Use DB stats as fallback when on-chain metadata attributes are missing
	const impactScore = impactScoreOnChain ?? String(userStats?.impactScore ?? 0)
	const donations = donationsOnChain ?? String(userStats?.totalDonations ?? 0)
	const quests = questsOnChain ?? String(userStats?.questsCompleted ?? 0)
	const streaks = streaksOnChain ?? String(userStats?.streakDays ?? 0)
	const referrals = referralsOnChain ?? String(userStats?.referralCount ?? 0)
	const currentPts = Number(impactScore) || userStats?.impactScore || 0
	const nextTierPts = tierConfig.nextPts
	const progressPct = nextTierPts
		? Math.min(
				100,
				Math.round(
					((currentPts - tierConfig.minPts) /
						(nextTierPts - tierConfig.minPts)) *
						100,
				),
			)
		: 100

	const nftContractAddress = dbNft?.contract_address

	return (
		<div className="space-y-6">
			{/* Hero card with NFT image and tier badge */}
			<Card className="overflow-hidden">
				<div className="flex flex-col sm:flex-row">
					{/* Image */}
					<div className="relative w-full sm:w-56 h-56 sm:h-auto bg-muted shrink-0">
						{nft?.metadata?.image_uri ? (
							<Image
								src={nft.metadata.image_uri}
								alt={nft.metadata.name}
								fill
								className="object-cover"
								unoptimized
							/>
						) : (
							<div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10">
								<ImageIcon className="h-16 w-16 text-muted-foreground" />
							</div>
						)}
						{(nft || dbNft) && (
							<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
								#
								{(nft?.tokenId ?? dbNft?.token_id ?? 0)
									.toString()
									.padStart(4, '0')}
							</div>
						)}
					</div>

					{/* Info */}
					<div className="flex-1 p-5 space-y-4">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3 className="text-xl font-bold">
									{nft?.metadata?.name ?? `${tierConfig.label} Kinder`}
								</h3>
								<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
									{nft?.metadata?.description ??
										'Your KindFi Kinder NFT represents your impact on the platform.'}
								</p>
							</div>
							<Badge className={`${tierConfig.color} border shrink-0`}>
								<Trophy className="h-3 w-3 mr-1" />
								{tierConfig.label}
							</Badge>
						</div>

						{/* Tier progress */}
						{nextTierPts ? (
							<div className="space-y-1.5">
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>
										<ArrowUp className="inline h-3 w-3 mr-0.5" />
										Next tier at {nextTierPts} pts
									</span>
									<span>
										{currentPts} / {nextTierPts} pts
									</span>
								</div>
								<Progress value={progressPct} className="h-2" />
							</div>
						) : (
							<div className="flex items-center gap-2 text-sm text-cyan-700">
								<Diamond className="h-4 w-4" />
								<span className="font-medium">Maximum tier reached!</span>
							</div>
						)}

						{/* Governance votes */}
						<p className="text-xs text-muted-foreground">
							Governance votes:{' '}
							<span className="font-semibold text-foreground">
								{govVotes || tierConfig.votes}
							</span>
						</p>

						{/* Stellar Expert link */}
						{smartAccountAddress && (
							<a
								href={getStellarExplorerAddressUrl(smartAccountAddress)}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								View on Stellar Expert
							</a>
						)}
					</div>
				</div>
			</Card>

			{/* Stats grid */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<StatBadge label="Impact" value={impactScore || '0'} />
				<StatBadge label="Donations" value={donations || '0'} />
				<StatBadge label="Quests" value={quests || '0'} />
				<StatBadge label="Streak" value={streaks || '0'} />
				<StatBadge label="Referrals" value={referrals || '0'} />
			</div>

			{/* NFT Metadata (expandable) */}
			<Card>
				<button
					type="button"
					onClick={() => setShowMetadata(!showMetadata)}
					className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
				>
					<div className="flex items-center gap-2">
						<Info className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">NFT Metadata & Details</span>
					</div>
					{showMetadata ? (
						<ChevronUp className="h-4 w-4 text-muted-foreground" />
					) : (
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					)}
				</button>
				{showMetadata && (
					<CardContent className="pt-0 pb-4 space-y-4">
						<div className="grid gap-3 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Token ID</span>
								<span className="font-mono">
									#
									{(nft?.tokenId ?? dbNft?.token_id ?? 0)
										.toString()
										.padStart(4, '0')}
								</span>
							</div>
							{nft?.metadata?.name && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Name</span>
									<span className="font-medium">{nft.metadata.name}</span>
								</div>
							)}
							{nft?.metadata?.description && (
								<div className="flex justify-between gap-4">
									<span className="text-muted-foreground shrink-0">
										Description
									</span>
									<span className="text-right">{nft.metadata.description}</span>
								</div>
							)}
							{nft?.metadata?.image_uri && (
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground shrink-0">
										Image URI
									</span>
									<a
										href={nft.metadata.image_uri}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline text-xs truncate max-w-[200px]"
									>
										{nft.metadata.image_uri}
									</a>
								</div>
							)}
							{nft?.metadata?.external_url && (
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground shrink-0">
										External URL
									</span>
									<a
										href={nft.metadata.external_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline text-xs truncate max-w-[200px]"
									>
										{nft.metadata.external_url}
									</a>
								</div>
							)}
						</div>
						{(attrs.length > 0 || userStats) && (
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-2">
									Attributes
								</p>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{attrs.length > 0
										? attrs.map((a) => (
												<div
													key={a.trait_type}
													className="bg-muted/60 rounded px-2 py-1.5 text-xs"
												>
													<span className="text-muted-foreground">
														{a.trait_type}:
													</span>{' '}
													<span className="font-medium">{a.value}</span>
												</div>
											))
										: userStats && (
												<>
													<AttrChip
														label="Impact Score"
														value={String(userStats.impactScore)}
													/>
													<AttrChip
														label="Total Donations"
														value={String(userStats.totalDonations)}
													/>
													<AttrChip
														label="Quests Completed"
														value={String(userStats.questsCompleted)}
													/>
													<AttrChip
														label="Streak Days"
														value={String(userStats.streakDays)}
													/>
													<AttrChip
														label="Referrals"
														value={String(userStats.referralCount)}
													/>
													<AttrChip label="Tier" value={tierConfig.label} />
												</>
											)}
								</div>
							</div>
						)}
						<div className="flex flex-wrap gap-2 pt-2 border-t">
							{smartAccountAddress && (
								<a
									href={getStellarExplorerAddressUrl(smartAccountAddress)}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View holdings on Stellar Expert
								</a>
							)}
							{nftContractAddress && (
								<a
									href={getStellarExplorerAddressUrl(nftContractAddress)}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View NFT contract on Stellar Expert
								</a>
							)}
						</div>
					</CardContent>
				)}
			</Card>

			{/* Additional NFTs (if any beyond the primary Kinder) */}
			{nfts.length > 1 && (
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
			)}

			{/* Tier roadmap */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Tier Roadmap</CardTitle>
					<p className="text-xs text-muted-foreground mt-1">
						You have one Kinder NFT that evolves through tiers. Marked tiers =
						achieved.
					</p>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						{(Object.entries(TIERS) as [Tier, (typeof TIERS)[Tier]][]).map(
							([key, cfg]) => {
								const isActive = key === tier
								const isPast = TIERS[tier].minPts >= cfg.minPts && !isActive
								return (
									<div
										key={key}
										className={`flex-1 text-center py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
											isActive
												? cfg.color + ' border'
												: isPast
													? 'bg-muted text-muted-foreground line-through'
													: 'bg-muted/50 text-muted-foreground'
										}`}
									>
										{cfg.label}
										<div className="text-[10px] font-normal mt-0.5 opacity-70">
											{cfg.minPts}+ pts
										</div>
									</div>
								)
							},
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

// ============================================================================
// Helpers
// ============================================================================

function findAttr(
	attrs: NFTAttribute[],
	traitType: string,
): string | undefined {
	return attrs.find((a) => a.trait_type === traitType)?.value
}

function AttrChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded px-2 py-1.5 text-xs">
			<span className="text-muted-foreground">{label}:</span>{' '}
			<span className="font-medium">{value}</span>
		</div>
	)
}

function StatBadge({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded-lg p-3 text-center">
			<p className="text-lg font-bold">{value}</p>
			<p className="text-[10px] text-muted-foreground uppercase tracking-wider">
				{label}
			</p>
		</div>
	)
}
