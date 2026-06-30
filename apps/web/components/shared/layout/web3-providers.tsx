'use client'

import { TrustlessWorkConfig } from '@trustless-work/escrow'
import { StellarProvider } from '~/hooks/contexts/stellar-context'
import { EscrowProvider } from '~/hooks/contexts/use-escrow.context'
import { WalletProvider } from '~/hooks/contexts/use-stellar-wallet.context'
import { getTrustlessWorkSdkBaseUrl } from '~/lib/config/trustless-work.config'

interface Web3ProvidersProps {
	children: React.ReactNode
}

/** Escrow, wallet, and Stellar providers — mount only on routes that need on-chain data. */
export function Web3Providers({ children }: Web3ProvidersProps) {
	return (
		<TrustlessWorkConfig baseURL={getTrustlessWorkSdkBaseUrl()} apiKey="">
			<WalletProvider>
				<EscrowProvider>
					<StellarProvider>{children}</StellarProvider>
				</EscrowProvider>
			</WalletProvider>
		</TrustlessWorkConfig>
	)
}
