import { Sparkles } from 'lucide-react'

export function NftNotConnected() {
	return (
		<div className="text-center py-12 text-muted-foreground">
			<Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
			<p>Connect your wallet to view your NFT collection</p>
		</div>
	)
}

export function NftLoading() {
	return (
		<div className="text-center py-12 text-muted-foreground">
			<p>Loading your Kinder NFT...</p>
		</div>
	)
}

export function NftEmpty() {
	return (
		<div className="text-center py-12">
			<Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
			<h3 className="text-lg font-semibold mb-2">No Kinder NFT Yet</h3>
			<p className="text-muted-foreground mb-2">Make your donations to receive a Kinders NFT!</p>
			<p className="text-xs text-muted-foreground">
				Your NFT evolves as you donate, complete quests, and refer friends.
			</p>
		</div>
	)
}
