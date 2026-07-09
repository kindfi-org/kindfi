import { getServerSession } from 'next-auth'
import { LayoutContainer } from '~/components/layout-container'
import { StellarNetworkProvider } from '~/hooks/contexts/stellar-network.context'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	getClientStellarNetworkId,
	getClientStellarNetworkPassphrase,
} from '~/lib/config/stellar-network.config'

export async function SessionShell({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(nextAuthOption)
	const stellarNetwork = {
		networkId: getClientStellarNetworkId(),
		networkPassphrase: getClientStellarNetworkPassphrase(),
	}

	return (
		<StellarNetworkProvider value={stellarNetwork}>
			<LayoutContainer session={session}>{children}</LayoutContainer>
		</StellarNetworkProvider>
	)
}
