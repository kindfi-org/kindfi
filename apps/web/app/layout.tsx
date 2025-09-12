import { appEnvConfig } from '@packages/lib'
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '~/components/shared/google-analytics'
import { Footer } from '~/components/shared/layout/footer/footer'
import { Header } from '~/components/shared/layout/header/header'
import { Providers } from '~/components/shared/layout/providers'
import './css/globals.css'
import type { AppEnvInterface } from '@packages/lib/types'

const appConfig: AppEnvInterface = appEnvConfig('web')

const defaultUrl = appConfig.deployment.vercelUrl
	? `https://${appConfig.deployment.vercelUrl}`
	: 'http://localhost:3000'
export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: {
		default: 'KindFi',
		template: '%s | KindFi',
	},
	description:
		'The first Web3 platform connecting supporters to impactful causes while driving blockchain adoption for social and environmental change',
	openGraph: {
		siteName: 'KindFi',
		type: 'website',
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<Providers>
					<div className="flex relative flex-col min-h-screen">
						<Header />
						<main className="flex-1">{children}</main>
						<Toaster />
						<Footer />
					</div>
				</Providers>
				<GoogleAnalytics GA_MEASUREMENT_ID={appConfig.analytics.gaId} />
			</body>
		</html>
	)
}
