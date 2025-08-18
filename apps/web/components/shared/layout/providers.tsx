'use client'

import { ReactQueryClientProvider } from '@packages/lib/providers'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'
import { WaitlistProvider } from '~/hooks/contexts/use-waitlist.context'
import { StellarProvider } from '~/hooks/stellar/stellar-context'
import { AuthProvider } from '~/hooks/use-auth'

interface ProvidersProps {
	children: React.ReactNode
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
	periodicSync?: {
		register(tag: string, options: { minInterval: number }): Promise<void>
	}
}

export function Providers({ children }: ProvidersProps) {
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

	return (
		<ReactQueryClientProvider>
			<NextThemesProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
			>
				<AuthProvider>
					<WaitlistProvider>
						<StellarProvider>{children}</StellarProvider>
					</WaitlistProvider>
				</AuthProvider>
			</NextThemesProvider>
		</ReactQueryClientProvider>
	)
}
