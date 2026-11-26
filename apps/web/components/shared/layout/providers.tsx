'use client'

import { ReactQueryClientProvider } from '@packages/lib/providers'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'
import { WalletProvider } from '~/hooks/contexts/use-stellar-wallet.context'
import { WaitlistProvider } from '~/hooks/contexts/use-waitlist.context'
import { AuthProvider } from '~/hooks/use-auth'
import { I18nProvider } from '~/lib/i18n/context'
import { registerNotificationServiceWorker } from '~/lib/notifications/browser-permission'
import { KindfiPollarProvider } from '~/lib/pollar/provider'

interface ProvidersProps {
	children: React.ReactNode
	initSession: Session | null
}

export function Providers({ children, initSession }: ProvidersProps) {
	useEffect(() => {
		// Registration only. Notification permission is requested from an explicit
		// opt-in control (see NotificationPermissionCard), never on page load.
		void registerNotificationServiceWorker()
	}, [])

	return (
		<ReactQueryClientProvider>
			<I18nProvider>
				<NextThemesProvider
					attribute="class"
					defaultTheme="light"
					forcedTheme="light"
					disableTransitionOnChange
				>
					{/* Keep Pollar outside SessionProvider so session key changes do not remount the SDK (avoids session/resume 429s). */}
					<KindfiPollarProvider>
						<SessionProvider
							key={initSession?.user?.id ?? 'guest'}
							session={initSession ?? undefined}
							refetchOnWindowFocus
						>
							<AuthProvider initSession={initSession}>
								<WalletProvider>
									<WaitlistProvider>{children}</WaitlistProvider>
								</WalletProvider>
							</AuthProvider>
						</SessionProvider>
					</KindfiPollarProvider>
				</NextThemesProvider>
			</I18nProvider>
		</ReactQueryClientProvider>
	)
}
