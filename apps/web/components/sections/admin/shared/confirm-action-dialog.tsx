'use client'

import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '~/components/base/alert-dialog'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { TruncatedId } from '~/components/sections/admin/shared/truncated-id'

export interface ConfirmActionSummaryRow {
	label: string
	value: ReactNode
}

interface ConfirmActionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	/** Structured summary: entity, current state → new state, amounts, etc. */
	summary?: ConfirmActionSummaryRow[]
	/**
	 * For blockchain mutations: the active Stellar network and the signer
	 * that will be asked to sign, shown before anything is submitted.
	 * `signerLabel` describes non-wallet signers (e.g. the platform service
	 * account that signs server-side).
	 */
	blockchain?: {
		networkId: string
		signerAddress?: string | null
		signerLabel?: string
		requiredSigner?: string | null
	}
	confirmLabel: string
	pendingLabel?: string
	/** Prevents duplicate submissions while the action is in flight. */
	isPending: boolean
	destructive?: boolean
	onConfirm: () => void
	children?: ReactNode
}

/**
 * Shared confirmation dialog for high-impact admin actions. Shows a clear
 * summary of what is about to happen; blockchain actions additionally show
 * the active network and connected signer. The confirm button is disabled
 * while the action is pending, so a double click cannot submit twice.
 */
export function ConfirmActionDialog({
	open,
	onOpenChange,
	title,
	description,
	summary,
	blockchain,
	confirmLabel,
	pendingLabel = 'Working…',
	isPending,
	destructive = false,
	onConfirm,
	children,
}: ConfirmActionDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				// The dialog cannot be dismissed while the action is running.
				if (isPending && !next) return
				onOpenChange(next)
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
				</AlertDialogHeader>

				{summary && summary.length > 0 ? (
					<dl className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
						{summary.map((row) => (
							<div key={row.label} className="flex items-start justify-between gap-4">
								<dt className="shrink-0 text-muted-foreground">{row.label}</dt>
								<dd className="min-w-0 text-right font-medium">{row.value}</dd>
							</div>
						))}
					</dl>
				) : null}

				{blockchain ? (
					<div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground">Stellar network</span>
							<Badge
								variant="outline"
								className={
									blockchain.networkId === 'mainnet'
										? 'border-red-300 bg-red-50 text-red-700'
										: 'border-blue-300 bg-blue-100 text-blue-800'
								}
							>
								{blockchain.networkId === 'mainnet' ? 'Mainnet' : 'Testnet'}
							</Badge>
						</div>
						{blockchain.signerAddress ? (
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">Connected signer</span>
								<TruncatedId value={blockchain.signerAddress} />
							</div>
						) : blockchain.signerLabel ? (
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">Signer</span>
								<span className="font-medium">{blockchain.signerLabel}</span>
							</div>
						) : null}
						{blockchain.requiredSigner ? (
							<div className="flex items-center justify-between gap-4">
								<span className="text-muted-foreground">Required signer</span>
								<TruncatedId value={blockchain.requiredSigner} />
							</div>
						) : null}
						<p className="text-xs text-muted-foreground">
							Nothing is signed or submitted until you confirm.
						</p>
					</div>
				) : null}

				{children}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<Button
						type="button"
						variant={destructive ? 'destructive' : 'default'}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2
									className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
									aria-hidden="true"
								/>
								{pendingLabel}
							</>
						) : (
							confirmLabel
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
