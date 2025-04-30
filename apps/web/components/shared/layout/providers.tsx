'use client'

import { ReactQueryClientProvider } from '@packages/lib/src/providers/react-query-client-provider'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { StellarProvider } from '~/hooks/stellar/stellar-context'
import { AuthProvider } from '~/hooks/use-auth'

interface ProvidersProps {
	children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<ReactQueryClientProvider>
			<NextThemesProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
			>
				<StellarProvider>
					<AuthProvider>{children}</AuthProvider>
				</StellarProvider>
			</NextThemesProvider>
		</ReactQueryClientProvider>
	)
}
