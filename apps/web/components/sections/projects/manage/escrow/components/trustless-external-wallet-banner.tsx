'use client'

import { AlertCircle, Link2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useI18n } from '~/lib/i18n'

interface TrustlessExternalWalletBannerProps {
	/** Tighter layout for the project donation sidebar */
	compact?: boolean
}

export function TrustlessExternalWalletBanner({
	compact = false,
}: TrustlessExternalWalletBannerProps) {
	const { t } = useI18n()
	const { isTrustlessReady, isConnected, connect } = useTrustlessSigner()

	if (isTrustlessReady) return null

	const showDescription = !compact

	return (
		<div
			className={
				compact
					? 'rounded-lg border border-amber-200 bg-amber-50/90 p-3'
					: 'rounded-xl border border-amber-200 bg-amber-50/90 p-4'
			}
		>
			<div
				className={
					compact
						? 'flex flex-col gap-2.5'
						: 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'
				}
			>
				<div className="flex gap-2.5">
					<AlertCircle
						className={
							compact
								? 'mt-0.5 h-4 w-4 shrink-0 text-amber-700'
								: 'mt-0.5 h-5 w-5 shrink-0 text-amber-700'
						}
					/>
					<div className={compact ? 'min-w-0 space-y-0.5' : 'space-y-1'}>
						<p
							className={
								compact
									? 'text-xs font-medium leading-snug text-amber-950'
									: 'text-sm font-semibold text-amber-950'
							}
						>
							{t('profile.trustlessWalletRequired')}
						</p>
						{showDescription ? (
							<p className="text-sm text-amber-900/90">
								{t('profile.trustlessWalletRequiredDetail')}
							</p>
						) : null}
					</div>
				</div>
				{!isConnected ? (
					<Button
						type="button"
						variant="outline"
						size={compact ? 'sm' : 'default'}
						className={
							compact
								? 'h-8 w-full rounded-full border-amber-300 bg-white text-xs'
								: 'shrink-0 rounded-full border-amber-300 bg-white'
						}
						onClick={() => connect()}
					>
						<Link2 className={compact ? 'mr-1.5 h-3.5 w-3.5' : 'mr-2 h-4 w-4'} />
						{t('profile.connectExternalWallet')}
					</Button>
				) : null}
			</div>
		</div>
	)
}
