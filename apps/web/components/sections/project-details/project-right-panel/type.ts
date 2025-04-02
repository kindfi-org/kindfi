export type NftTier = {
	title: string
	description: string
	rightSite: string
}

export type ProjectData = {
	title: string
	raisedAmount: string
	goalAmount: string
	percentageRaised: number
	nftTiers: NftTier[]
}

export type viewModeProps = 'initial' | 'donated' | 'closed'
