import type { StatsProps } from '~/lib/types'

export function StatsSection({
	totalNFTs,
	rareItems,
	collections,
}: StatsProps) {
	return (
		<div className="grid grid-cols-3 gap-4 border-t border-border pt-8 mt-8">
			<div className="text-center">
				<p className="text-2xl font-semibold">{totalNFTs}</p>
				<p className="text-sm text-muted-foreground">Total NFTs</p>
			</div>
			<div className="text-center">
				<p className="text-2xl font-semibold">{rareItems}</p>
				<p className="text-sm text-muted-foreground">Rare items</p>
			</div>
			<div className="text-center">
				<p className="text-2xl font-semibold">{collections}</p>
				<p className="text-sm text-muted-foreground">Collections</p>
			</div>
		</div>
	)
}
