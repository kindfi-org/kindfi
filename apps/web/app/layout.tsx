import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { getServerSession } from 'next-auth'
import { LayoutContainer } from '~/components/layout-container'
import { GoogleAnalytics } from '~/components/shared/google-analytics'
import { nextAuthOption } from '~/lib/auth/auth-options'

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

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await getServerSession(nextAuthOption)
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<LayoutContainer session={session}>{children}</LayoutContainer>
				<GoogleAnalytics GA_MEASUREMENT_ID={appConfig.analytics.gaId} />
			</body>
		</html>
	)
}
