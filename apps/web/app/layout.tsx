import { Toaster } from 'sonner'
import { GoogleAnalytics } from '~/components/shared/google-analytics'
import { Footer } from '~/components/shared/layout/footer/footer'
import { Header } from '~/components/shared/layout/header/header'
import { Providers } from '~/components/shared/layout/providers'
import './css/globals.css'

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000'
export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'KindFi',
	description:
		'The first Web3 platform connecting supporters to impactful causes while driving blockchain adoption for social and environmental change',
}

export function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body suppressHydrationWarning>
				<Providers>
					<div className="relative min-h-screen flex flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Toaster />
						<Footer />
					</div>
				</Providers>
				<GoogleAnalytics
					GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''}
				/>
			</body>
		</html>
	)
}
