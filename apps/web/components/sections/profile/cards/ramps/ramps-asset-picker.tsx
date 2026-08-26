'use client'

import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Label } from '~/components/base/label'
import { useEtherfuseRampAssets } from '~/hooks/use-etherfuse-ramp-assets'
import { cn } from '~/lib/utils'
import { getRampAssetAccent } from './constants'

interface RampsAssetPickerProps {
	currency: string
	walletAddress: string
	value: string
	onChange: (identifier: string) => void
	disabled?: boolean
	label: string
	emptyMessage: string
	loadingMessage: string
}

export function RampsAssetPicker({
	currency,
	walletAddress,
	value,
	onChange,
	disabled = false,
	label,
	emptyMessage,
	loadingMessage,
}: RampsAssetPickerProps) {
	const { data: assets = [], isLoading, isError } = useEtherfuseRampAssets(currency, walletAddress)

	useEffect(() => {
		if (assets.length === 0) {
			return
		}

		const hasSelectedAsset = assets.some((asset) => asset.identifier === value)
		if (!hasSelectedAsset) {
			onChange(assets[0].identifier)
		}
	}, [assets, onChange, value])

	return (
		<div className="space-y-3">
			<Label>{label}</Label>
			{isLoading ? (
				<div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-6 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					{loadingMessage}
				</div>
			) : isError || assets.length === 0 ? (
				<div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
					{emptyMessage}
				</div>
			) : (
				<div className="grid gap-2 sm:grid-cols-3">
					{assets.map((asset) => {
						const selected = value === asset.identifier
						return (
							<button
								key={asset.identifier}
								type="button"
								disabled={disabled}
								onClick={() => onChange(asset.identifier)}
								className={cn(
									'rounded-2xl border p-3 text-left transition-all',
									selected
										? cn('ring-1', getRampAssetAccent(asset.symbol))
										: 'border-slate-200/80 bg-slate-50/50 hover:bg-white',
								)}
							>
								<p className="text-sm font-semibold text-gray-900">{asset.symbol}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">{asset.name}</p>
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
