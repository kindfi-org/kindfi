'use client'

import Link from 'next/link'
import { Button } from '~/components/base/button'
import type { WalletSendFlowResult } from '~/hooks/wallet-send/use-wallet-send-flow'
import type { ClientStellarNetworkId } from '~/lib/config/stellar-network.config'
import { useI18n } from '~/lib/i18n'
import { getStellarExplorerTxUrl } from '~/lib/utils/escrow/stellar-explorer'

interface SendAssetsResultProps {
	result: WalletSendFlowResult
	networkId: ClientStellarNetworkId
	onReset: () => void
}

export const SendAssetsResult = ({ result, networkId, onReset }: SendAssetsResultProps) => {
	const { t } = useI18n()
	const explorerUrl = result.hash ? getStellarExplorerTxUrl(result.hash, networkId) : ''

	return (
		<div className="space-y-4">
			<div
				className={
					result.status === 'success'
						? 'rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900'
						: 'rounded-xl border border-red-200 bg-red-50 p-4 text-red-900'
				}
			>
				<p className="font-medium">
					{result.status === 'success'
						? t('profile.sendAssetsSuccessTitle')
						: t('profile.sendAssetsFailureTitle')}
				</p>
				<p className="mt-1 text-sm">{result.message}</p>
				{result.code === 'pollar_policy' ? (
					<p className="mt-2 text-sm">{t('profile.sendAssetsPollarPolicyHint')}</p>
				) : null}
			</div>

			{result.hash && explorerUrl ? (
				<Link
					href={explorerUrl}
					target="_blank"
					rel="noreferrer"
					className="text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					{t('profile.sendAssetsViewExplorer')}
				</Link>
			) : null}

			<Button type="button" variant="outline" onClick={onReset}>
				{t('profile.sendAssetsSendAnother')}
			</Button>
		</div>
	)
}
