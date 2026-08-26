'use client'

import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import type { PollarClient } from '@pollar/core'
import { PollarProvider } from '@pollar/react'
import '@pollar/react/styles.css'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { isPollarConfigured } from './config'
import { getKindfiPollarClient } from './pollar-client-singleton'
import { useIsClient } from './use-is-client'

const PollarProviderReadyContext = createContext(false)

/** True once the singleton Pollar client is mounted inside PollarProvider. */
export const usePollarProviderReady = (): boolean => useContext(PollarProviderReadyContext)

interface KindfiPollarProviderProps {
	children: ReactNode
}

export const KindfiPollarProvider = ({ children }: KindfiPollarProviderProps) => {
	const isClient = useIsClient()
	const pollarEnabled = isPollarOnboardingEnabled() && isPollarConfigured()
	const [client, setClient] = useState<PollarClient | null>(null)

	useEffect(() => {
		if (!pollarEnabled) {
			return
		}
		setClient(getKindfiPollarClient())
	}, [pollarEnabled])

	const ready = pollarEnabled && isClient && Boolean(client)

	return (
		<PollarProviderReadyContext.Provider value={ready}>
			{!pollarEnabled || !client ? (
				children
			) : (
				<PollarProvider client={client}>{children}</PollarProvider>
			)}
		</PollarProviderReadyContext.Provider>
	)
}
