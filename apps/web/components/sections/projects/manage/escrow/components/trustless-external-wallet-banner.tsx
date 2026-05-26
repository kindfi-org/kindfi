'use client'

import { AlertCircle, Link2 } from 'lucide-react'
import { Button } from '~/components/base/button'
import { useTrustlessSigner } from '~/hooks/escrow/use-trustless-signer'
import { useI18n } from '~/lib/i18n'

export function TrustlessExternalWalletBanner() {
	const { t } = useI18n()
	const { isTrustlessReady, isConnected, connect } = useTrustlessSigner()

	if (isTrustlessReady) return null

	return (
		<div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex gap-3">
					<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
					<div className="space-y-1">
						<p className="text-sm font-semibold text-amber-950">
							{t('profile.trustlessWalletRequired')}
						</p>
						<p className="text-sm text-amber-900/90">
							{t('profile.trustlessWalletRequiredDescription')}
						</p>
					</div>
				</div>
				{!isConnected ? (
					<Button
						type="button"
						variant="outline"
						className="shrink-0 rounded-full border-amber-300 bg-white"
						onClick={() => connect()}
					>
						<Link2 className="mr-2 h-4 w-4" />
						{t('profile.connectExternalWallet')}
					</Button>
				) : null}
			</div>
		</div>
	)
}
