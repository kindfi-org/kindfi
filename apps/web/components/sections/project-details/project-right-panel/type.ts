export type NftTier = {
	title: string
	description: string
	rightSide: string
}

export type ProjectData = {
	title: string
	raisedAmount: string
	goalAmount: string
	percentageRaised: number
	nftTiers: NftTier[]
}

export type ViewModeProps = 'initial' | 'donated' | 'closed'
