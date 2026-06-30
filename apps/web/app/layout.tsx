import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import dynamic from 'next/dynamic'
import { LayoutContainer } from '~/components/layout-container'
import { JsonLd } from '~/components/shared/json-ld'
import { getOrganizationSchema, getWebSiteSchema, SITE_URL } from '~/lib/seo/structured-data'

const GoogleAnalytics = dynamic(
	() =>
		import('~/components/shared/google-analytics').then((mod) => ({
			default: mod.GoogleAnalytics,
		})),
	{ ssr: false },
)

const appConfig: AppEnvInterface = appEnvConfig('web')

export const metadata = {
	metadataBase: new URL(SITE_URL),
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
	authors: [{ name: 'KindFi', url: SITE_URL }],
	creator: 'KindFi',
	publisher: 'KindFi',
	openGraph: {
		siteName: 'KindFi',
		type: 'website',
		locale: 'en_US',
		url: SITE_URL,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
			</head>
			<body suppressHydrationWarning>
				<LayoutContainer session={null}>{children}</LayoutContainer>
				{appConfig.analytics.gaId ? (
					<GoogleAnalytics GA_MEASUREMENT_ID={appConfig.analytics.gaId} />
				) : null}
			</body>
		</html>
	)
}
