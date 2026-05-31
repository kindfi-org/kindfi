import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { getServerSession } from 'next-auth'
import { LayoutContainer } from '~/components/layout-container'
import { GoogleAnalytics } from '~/components/shared/google-analytics'
import { JsonLd } from '~/components/shared/json-ld'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	getOrganizationSchema,
	getWebSiteSchema,
} from '~/lib/seo/structured-data'

const appConfig: AppEnvInterface = appEnvConfig('web')

const defaultUrl = appConfig.deployment.vercelUrl
	? `https://${appConfig.deployment.vercelUrl}`
	: 'http://localhost:3000'
export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: {
		default: 'KindFi — Web3 Crowdfunding for Social Impact',
		template: '%s | KindFi',
	},
	description:
		'KindFi is the first Web3 crowdfunding platform connecting supporters to impactful social and environmental causes. Milestone-based funding on Stellar ensures transparency, accountability, and real-world impact.',
	keywords: [
		'blockchain crowdfunding',
		'social impact',
		'Web3 donations',
		'Stellar blockchain',
		'crypto philanthropy',
		'NGO funding',
		'decentralized fundraising',
	],
	authors: [{ name: 'KindFi', url: defaultUrl }],
	creator: 'KindFi',
	publisher: 'KindFi',
	openGraph: {
		siteName: 'KindFi',
		type: 'website',
		locale: 'en_US',
		url: defaultUrl,
		images: [
			{
				url: '/images/og-home.png',
				width: 1200,
				height: 630,
				alt: 'KindFi — Web3 Crowdfunding for Social Impact',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@kindfi_org',
		creator: '@kindfi_org',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large' as const,
			'max-snippet': -1,
		},
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
				<JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
				<LayoutContainer session={session}>{children}</LayoutContainer>
				<GoogleAnalytics GA_MEASUREMENT_ID={appConfig.analytics.gaId} />
			</body>
		</html>
	)
}
