'use client'

import { ReactQueryClientProvider } from '@packages/lib/providers'
import { development, TrustlessWorkConfig } from '@trustless-work/escrow'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'
import { StellarProvider } from '~/hooks/contexts/stellar-context'
import { EscrowProvider } from '~/hooks/contexts/use-escrow.context'
import { WalletProvider } from '~/hooks/contexts/use-stellar-wallet.context'
import { WaitlistProvider } from '~/hooks/contexts/use-waitlist.context'
import { AuthProvider } from '~/hooks/use-auth'
import { I18nProvider } from '~/lib/i18n/context'
import { translations } from '~/lib/i18n/translations'

interface ProvidersProps {
	children: React.ReactNode
	initSession: Session | null
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
	periodicSync?: {
		register(tag: string, options: { minInterval: number }): Promise<void>
	}
}

export function Providers({ children, initSession }: ProvidersProps) {
	useEffect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/notification-worker.js', {
					scope: '/',
				})
				.then((registration) => {
					console.log(
						'Service Worker registered with scope:',
						registration.scope,
					)

					// Request notification permission
					if ('Notification' in window) {
						Notification.requestPermission().then((permission) => {
							if (permission === 'granted') {
								console.log('Notification permission granted')
							}
						})
					}

					// Set up periodic sync if supported
					try {
						const reg = registration as ServiceWorkerRegistrationWithSync
						if (reg.periodicSync) {
							// TODO: Fix registration, crashing on some MacOs due lack of permissions on browsers by default...
							// reg.periodicSync
							// 	.register('notification-sync', {
							// 		minInterval: 24 * 60 * 60 * 1000, // 24 hours
							// 	})
							// 	.catch((error) => {
							// 		console.error('Periodic sync registration failed:', error)
							// 	})
						}
					} catch (error) {
						console.error('Periodic sync not supported:', error)
					}
				})
				.catch((error) => {
					console.error('Service worker registration failed:', error)
				})
		}
	}, [])

	const trustlessBaseUrl = development
	// process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
	// process.env.NODE_ENV === 'production'
	// 	? mainNet
	// 	: development

	return (
		<ReactQueryClientProvider>
			<I18nProvider translations={translations}>
				<NextThemesProvider
					attribute="class"
					defaultTheme="light"
					forcedTheme="light"
					disableTransitionOnChange
				>
					<SessionProvider>
						<AuthProvider initSession={initSession}>
							<WaitlistProvider>
								<TrustlessWorkConfig
									baseURL={trustlessBaseUrl}
									apiKey={process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY || ''}
								>
									<WalletProvider>
										<EscrowProvider>
											<StellarProvider>{children}</StellarProvider>
										</EscrowProvider>
									</WalletProvider>
								</TrustlessWorkConfig>
							</WaitlistProvider>
						</AuthProvider>
					</SessionProvider>
				</NextThemesProvider>
			</I18nProvider>
		</ReactQueryClientProvider>
	)
}
