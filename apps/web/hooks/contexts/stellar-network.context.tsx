'use client'

import { createContext, useContext } from 'react'
import {
	type ClientStellarNetworkId,
	getClientStellarNetworkId,
	getClientStellarNetworkPassphrase,
} from '~/lib/config/stellar-network.config'

export type StellarNetworkConfig = {
	networkId: ClientStellarNetworkId
	networkPassphrase: string
}

const StellarNetworkContext = createContext<StellarNetworkConfig | null>(null)

export const StellarNetworkProvider = ({
	children,
	value,
}: {
	children: React.ReactNode
	value: StellarNetworkConfig
}) => <StellarNetworkContext.Provider value={value}>{children}</StellarNetworkContext.Provider>

/** Runtime Stellar network from the server shell; falls back to build-time env in tests. */
export const useStellarNetworkConfig = (): StellarNetworkConfig => {
	const context = useContext(StellarNetworkContext)
	if (context) return context

	return {
		networkId: getClientStellarNetworkId(),
		networkPassphrase: getClientStellarNetworkPassphrase(),
	}
}
