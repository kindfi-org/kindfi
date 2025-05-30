'use client'

import { ReactQueryClientProvider } from '@packages/lib/providers'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { StellarProvider } from '~/hooks/stellar/stellar-context'
import { AuthProvider } from '~/hooks/use-auth'
import { NotificationProvider } from '~/providers/notification-provider'

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
					<AuthProvider>
						<NotificationProvider>{children}</NotificationProvider>
					</AuthProvider>
				</StellarProvider>
			</NextThemesProvider>
		</ReactQueryClientProvider>
	)
}
