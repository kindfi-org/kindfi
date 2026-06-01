import type { NFTAttribute } from '../types'

export function findAttr(attrs: NFTAttribute[], traitType: string): string | undefined {
	return attrs.find((a) => a.trait_type === traitType)?.value
}

export function AttrChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded px-2 py-1.5 text-xs">
			<span className="text-muted-foreground">{label}:</span>{' '}
			<span className="font-medium">{value}</span>
		</div>
	)
}

export function StatBadge({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-muted/60 rounded-lg p-3 text-center">
			<p className="text-lg font-bold">{value}</p>
			<p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
		</div>
	)
}
